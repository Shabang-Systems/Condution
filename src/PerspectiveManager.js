let dbObj = require("./ObjectManager");

const perspectiveHandler = function(){
    let cgs = {
        taskFilter: /([^\w\d\s\[]{1,2}[\w\s]+)/gi,
        taskCaptureGroup: /\[(([^\w\d\s]{1,2}[\w\s]+) *)*?\]/gi,
        logicCaptureGroup: /(.*) *([<=>]) *(.*)/gi,
        globalCaptureGroup: /\[(([^\w\d\s]{1,2}[\w\s]+) *)*?\](\$\w+)* *[<=>]* * *(\$\w+)*/gi,
        clear: function() {
            this.taskFilter.lastIndex = 0;
            this.taskCaptureGroup.lastIndex = 0;
            this.logicCaptureGroup.lastIndex = 0;
            this.globalCaptureGroup.lastIndex = 0;
        }
    };

    let getCaptureGroups = (str) => str.match(cgs.globalCaptureGroup);

    let parseTaskCaptureGroup = (str) => (str.split("$").map(i=>i.trim()));

    let parseSpecialVariables = function(...val) {
        let vr;
        switch(val[0]) {
           case "today":
               vr = new Date();
               break;
        }
        return vr;
    };

    let compileTask = async function(uid, str, pPaT, additionalFilter) {
        let queries = additionalFilter ? [additionalFilter] : [];
        let taskCache = [];
        let antiCache = [];
        await Promise.all(str.match(cgs.taskFilter).map(async function(e) {
            e = e.trim();
            if (e[0] !== "!") {
                switch (e[0]) {
                    case ".":
                        let pid = pPaT[0][1][e.slice(1, e.length)];
                        queries.push(['project', '==', pid]);
                        let pS = await dbObj.getProjectStructure(uid, pid);
                        for (let i of pS.children)
                            if (i.type === "project")
                                taskCache = [...taskCache, ...(await compileTask(uid, str.replace(e.slice(1, e.length), pPaT[0][0][i.content.id]), pPaT, additionalFilter))];
                        break;
                    case "#":
                        queries.push(['tags', 'has',  pPaT[1][1][e.slice(1, e.length)]]);
                }
            } else {
                switch (e[1]) {
                    case ".":
                        let pid = pPaT[0][1][e.slice(2, e.length)];
                        queries.push(['project', '!=', pid]);

                        let pS = await dbObj.getProjectStructure(uid, pid);
                        for (let i of pS.children)
                            if (i.type === "project")
                                antiCache = [...antiCache, ...(await compileTask(uid, str.replace(e, "."+pPaT[0][0][i.content.id]), pPaT, additionalFilter))];
                        break;
                    case "#":
                        queries.push(['tags', '!has',  pPaT[1][1][e.slice(2, e.length)]]);
                }
            }
            queries.push(['isComplete', '==', false]);
        }));
        return [...taskCache, ...(await dbObj.getTasksWithQuery(uid, dbObj.util.select.all(...queries)))].filter(i=>(!antiCache.includes(i)));
    };

    let compileLogicCaptureGroup = async function(uid, tasks, cmp, value, ltr) {
        let taskInfo = await Promise.all(tasks[0].map(async function(t){
            return [await dbObj.getTaskInformation(uid, t), t];
        }));
        let taskCompValues;
        // TODO: add more?
        if (tasks[1].includes("due")) {
            taskCompValues = taskInfo.map(t => [t[1], (t[0].due ? new Date((t[0].due.seconds)*1000) : undefined)]);
        } else if (tasks[1].includes("defer")) {
            taskCompValues = taskInfo.map(t => [t[1], (t[0].defer ? new Date((t[0].defer.seconds)*1000) : undefined)]);
        }
        let filteredResults;
        let util_datesequal = function(dateA, dateB) {
            return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
        };
        switch (cmp) {
            case "=":
                taskCompValues = taskCompValues.filter(t=>util_datesequal(t[1], value));
                break;
            case ">":
                ltr ? taskCompValues = taskCompValues.filter(t => t[1] > value) : taskCompValues = taskCompValues.filter(t => t[1] < value);
                break;
            case "<":
                ltr ? taskCompValues = taskCompValues.filter(t => t[1] < value) : taskCompValues = taskCompValues.filter(t => t[1] > value);
                break;
            case ">=":
                ltr ? taskCompValues = taskCompValues.filter(t => t[1] >= value) : taskCompValues = taskCompValues.filter(t => t[1] <= value);
                break;
            case "<=":
                ltr ? taskCompValues = taskCompValues.filter(t => t[1] <= value) : taskCompValues = taskCompValues.filter(t => t[1] >= value);
                break;

        }
        return (taskCompValues.map(t => t[0]));
    };

    let getPerspectiveFromString = async function(uid, pStr, filter, order) {
        let pPaT = await dbObj.getProjectsandTags(uid);
        let pRes = await getCaptureGroups(pStr);
        if (!pRes) {
            return [];
        }
        let fquery; 
        switch (filter) {
            case "avail":
                fquery = ["defer", "<", ((new Date()).getTime())/1000];
                break;
            case "flagged":
                fquery = ["isFlagged", "==", true];
                break;
        }
        let tasks = await Promise.all(pRes.map(async function(i) {
            cgs.clear();
            let logicSort = cgs.logicCaptureGroup.exec(i);
            let t;
            if(logicSort) {
                // handle logic group
                let [, lhs, cmp, rhs] = logicSort;
                [lhs, rhs] = [parseTaskCaptureGroup(lhs), parseTaskCaptureGroup(rhs)];
                if (cgs.taskCaptureGroup.test(lhs)) {
                    lhs = [await compileTask(uid, lhs[0], pPaT, fquery), lhs[1]];
                    rhs = parseSpecialVariables(rhs[1]);
                    t = (await compileLogicCaptureGroup(uid, lhs, cmp, rhs, true)); // true (that is, left to right order)
                } else {
                    rhs = [await compileTask(uid, rhs[0], pPaT, fquery), rhs[1]];
                    lhs = parseSpecialVariables(lhs[1]);
                    t = (await compileLogicCaptureGroup(uid, rhs, cmp, lhs, false)); // false (that is, right to left order)
                }
            } else {
                // handle standard group
                t = (await compileTask(uid, i, pPaT, fquery));
            }
            return t;
        }));
        tasks = [...new Set(tasks.flat(1))];
        let taskObjs = await Promise.all(tasks.map(async function(t){
            return {id: t, ...(await dbObj.getTaskInformation(uid, t))}
        })).then(values=>values);
        switch (order) {
            case "duas":
                taskObjs.sort((a,b)=>(a.due?a.due.seconds:10000000000)-(b.due?b.due.seconds:10000000000))
                break;
            case "duds":
                taskObjs.sort((a,b)=>(b.due?b.due.seconds:1)-(a.due?a.due.seconds:1))
                break;
            case "deas":
                taskObjs.sort((a,b)=>(a.defer?a.defer.seconds:10000000000)-(b.defer?b.defer.seconds:10000000000))
                break;
            case "deds":
                taskObjs.sort((a,b)=>(b.defer?b.defer.seconds:1)-(a.defer?a.defer.seconds:1))
                break;

        }
        // Final avaliablitiy filter for sequential
        let aval = await dbObj.getItemAvailability(uid);
        if (filter === "avail") taskObjs = taskObjs.filter(it => (aval[it.id] !== undefined)); 
        return taskObjs.map(t=>t.id);
    };

    return {calc: getPerspectiveFromString};
}();

module.exports = perspectiveHandler;

