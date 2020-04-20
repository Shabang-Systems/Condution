const perspective = function(){
    let cgs = {
        taskFilter = /([^\w\d\s\[]{1,2}\w+)/gi,
        taskCaptureGroup = /\[(([^\w\d\s]{1,2}\w+) *)*?\]/gi,
        logicCaptureGroup = /(.*) *([<=>]) *(.*)/gi,
        globalCaptureGroup = /\[(([^\w\d\s]{1,2}\w+) *)*?\](\$\w+)* *[<=>]* * *(\$\w+)*/gi,
    }

    let getCaptureGroups = (str) => str.match(cgs.globalCaptureGroup);

    let parseTaskCaptureGroup = (str) => str.split("$");

    let compileTask = function(str, pPaT) {
        let queries = []
        str.match(cgs.taskFilter).forEach(function(e) {
            if (e[0] == "!") {
                e.includes(".") ? queries.push(['project', '!=',  pPaT[0][1][e.slice(1, e.length)]]) : queries.push(['tags', '!has', pPaT[1][1][e.slice(1, e.length)]]);
            } else {
                e.includes(".") ? queries.push(['project', '==',  pPaT[0][1][e.slice(1, e.length)]]) : queries.push(['tags', 'has', pPaT[1][1][e.slice(1, e.length)]]);
            }
        });
        return getTasksWithQuery(uid, util.select.all(queries))
    }

    let parseSpecialVariables = function(...val) {
        let vr;
        switch(val[0]) {
           case "today":
               vr = new Date();
               break;
        }
        return vr;
    }


    let getPerspectiveFromString = async function(uid, pStr) {
        let logicParsedGroups = []
        let pPaT = await getProjectsandTags(uid);
        getCaptureGroups(pStr).forEach(function(i) {
            let logicSort = cgs.logicCaptureGroup.exec(i);
            if(logicSort) {
                // handle logic group
                lhs, cmp, rhs = logicSort;
                lhs, rhs = [parseTaskCaptureGroup(lhs), parseTaskCaptureGroup(rhs)];

                if (lhs.test(taskCaptureGroup)) {
                    lhs = [await compileTask(lhs[0], pPaT), lhs[1]];
                    rhs = parseSpecialVariables(rhs[1]);
                } else {
                    rhs = [await compileTask(rhs[0], pPaT), rhs[1]];
                    lhs = parseSpecialVariables(lhs[1]);
                }
            } else {
                // handle standard group

            }
        });
/*        let matchedTasks = pStr.match(filters.task);*/
        //let matchTaskFilters = {};
        //let tasksIndex = {};
        //let index = 0;
        //matchedTasks.forEach(function(i){
            //matchTaskFilters[i] = (i.substring(1,i.length-1).match(filters.taskFilter));
            //tasksIndex[i] = "{{"+index+"}}";
            //index++;
        //});
        //matchedTasks.forEach((i)=>pStr=pStr.replace(i, tasksIndex[i]));
        //let taskParsedPStr = pStr.split(" ").map((i)=>i.split("$"));
        /*return [pStr, tasksIndex, taskParsedPStr];*/
    }

    return {calc: getPerspectiveFromString};
}();

