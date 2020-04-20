const perspective = function(){
    let cgs = {
        taskFilter = /([^\w\d\s\[]{1,2}\w+)/gi,
        taskCaptureGroup = /\[(([^\w\d\s]{1,2}\w+) *)*?\]/gi,
        logicCaptureGroup = /(.*) *([<=>]) *(.*)/gi,
        globalCaptureGroup = /\[(([^\w\d\s]{1,2}\w+) *)*?\](\$\w+)* *[<=>]* * *(\$\w+)*/gi,
    }

    let getCaptureGroups = (str) => str.match(cgs.globalCaptureGroup);

    let parseTaskCaptureGroup = (str) => str.split("$");

    let parseTask = function(str) {
        let queries = []
        str.match(cgs.taskFilter).forEach(function(e) {
            if (e[0] === ".") {
                queries.push([e.slice])
            }
        });
        getTasksWithQuery(uid, util.select.all())
    }

    let getPerspectiveFromString = function(uid, pStr) {
        let logicParsedGroups = []
        getCaptureGroups(pStr).forEach(function(i) {
            let logicSort = cgs.logicCaptureGroup.exec(i);
            if(logicSort) {
                // handle logic group
                lhs, cmp, rhs = logicSort;
                lhs, rhs = [parseTaskCaptureGroup(lhs), parseTaskCaptureGroup(rhs)];
                if (lhs.test(taskCaptureGroup)) {
                    switch (rhs[1]) {
                        case "today":
                            rhs = new Date();
                            break;
                    }
                    lhs[0] = parseTask(lhs[0]);
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

