const perspective = function(){
    let cgs = {
        taskFilter: /([^\w\d\s\[]{1,2}\w+)/gi,
        taskCaptureGroup: /\[(([^\w\d\s]{1,2}\w+) *)*?\]/gi,
        logicCaptureGroup: /(.*) *([<=>]) *(.*)/gi,
        globalCaptureGroup: /\[(([^\w\d\s]{1,2}\w+) *)*?\](\$\w+)* *[<=>]* * *(\$\w+)*/gi,
        clear: function() {
            this.taskFilter.lastIndex = 0;
            this.taskCaptureGroup.lastIndex = 0;
            this.logicCaptureGroup.lastIndex = 0;
            this.globalCaptureGroup.lastIndex = 0;
        }
    }

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
    }

    let compileTask = async function(uid, str, pPaT) {
        let queries = []
        console.log(str);
        str.match(cgs.taskFilter).forEach(function(e) {
            if (e[0] == "!") {
                e.includes(".") ? queries.push(['project', '!=',  pPaT[0][1][e.slice(1, e.length)]]) : queries.push(['tags', '!has', pPaT[1][1][e.slice(1, e.length)]]);
            } else {
                e.includes(".") ? queries.push(['project', '==',  pPaT[0][1][e.slice(1, e.length)]]) : queries.push(['tags', 'has', pPaT[1][1][e.slice(1, e.length)]]);
            }
        });
        console.log(queries);
        return await getTasksWithQuery(uid, util.select.all(...queries))
    }

    let compileLogicCaptureGroup = async function(uid, tasks, cmp, value, ltr) {
        let taskInfo = await Promise.all(tasks[0].map(async function(t){
            return [await getTaskInformation(uid, t), t];
        }));
        let taskCompValues;
        // TODO: add more?
        if (tasks[1].includes("due")) {
            taskCompValues = taskInfo.map(t=>[t[1], new Date((t[0].due)*1000)]);
        } else if (tasks[1].includes("defer")) {
            taskCompValues = taskInfo.map(t=>[t[1], new Date((t[0].defer)*1000)]);
        }
        let filteredResults;
        let util_datesequal = function(dateA, dateB) {
            return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
        }
        switch (cmp) {
            case "=":
                taskCompValues = taskCompValues.filter(t=>util_datesequal(t[1], value));
                break;
            case ">":
                ltr ? taskCompValues = taskCompValues.filter(t=>t[1]>value) : taskCompValues = taskCompValues.filter(t=>t[1]<value);
                break;
            case "<":
                ltr ? taskCompValues = taskCompValues.filter(t=>t[1]<value) : taskCompValues = taskCompValues.filter(t=>t[1]>value);
                break;
            case ">=":
                ltr ? taskCompValues = taskCompValues.filter(t=>t[1]>=value) : taskCompValues = taskCompValues.filter(t=>t[1]<=value);
                break;
            case "<=":
                ltr ? taskCompValues = taskCompValues.filter(t=>t[1]<=value) : taskCompValues = taskCompValues.filter(t=>t[1]>=value);
                break;

        }
        return (taskCompValues.map(t=>t[0]));
    }

    let getPerspectiveFromString = async function(uid, pStr) {
        let logicParsedGroups = []
        let pPaT = await getProjectsandTags(uid);
        let tasks = await Promise.all(getCaptureGroups(pStr).map(async function(i) {
            cgs.clear();
            let logicSort = cgs.logicCaptureGroup.exec(i);
            console.log(i);
            if(logicSort) {
                // handle logic group
                let [, lhs, cmp, rhs] = logicSort;
                [lhs, rhs] = [parseTaskCaptureGroup(lhs), parseTaskCaptureGroup(rhs)];
                if (cgs.taskCaptureGroup.test(lhs)) {
                    lhs = [await compileTask(uid, lhs[0], pPaT), lhs[1]];
                    rhs = parseSpecialVariables(rhs[1]);
                    return (await compileLogicCaptureGroup(uid, lhs, cmp, rhs, true)); // true (that is, left to right order)
                } else {
                    rhs = [await compileTask(uid, rhs[0], pPaT), rhs[1]];
                    lhs = parseSpecialVariables(lhs[1]);
                    return (await compileLogicCaptureGroup(uid, rhs, cmp, lhs, false)); // false (that is, right to left order)
                }
            } else {
                // handle standard group
            return (await compileTask(uid, i, pPaT));
            }
        }));
        return tasks;
        // TODO: sorting thing?
    }

    return {calc: getPerspectiveFromString};
}();

