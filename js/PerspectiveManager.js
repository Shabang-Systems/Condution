var perspective = function(){
    let filters = {
        taskFilter = /([^\w\d\s]{1,2}\w+)/gi,
        task = /\[(([^\w\d\s]{1,2}\w+) *)*?\]/gi,
        globalCaptureGroup = /\[(([^\w\d\s]{1,2}\w+) *)*?\](\$\w+)* *[<=>]* * *(\$\w+)*/gi,
    }

    let getCaptureGroups = (str) => str.match(filters.globalCaptureGroup);

    let getPerspectiveFromString = function(pStr) {
        let capGroups = getCaptureGroups(pStr);
        let lhs
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

    return {parse: getPerspectiveFromString};
}();

