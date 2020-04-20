var perspective = function(){
    let getPerspectiveFromString = function(pStr) {
        let tasks = /\((([^\w\d\s]{1,2}\w+) *)+?\)/gi
        let taskFilters = /([^\w\d\s]{1,2}\w+)/gi
        let matchedTasks = pStr.match(tasks);
        let matchTaskFilters = {};
        let tasksIndex = {};
        let index = 0;
        matchedTasks.forEach(function(i){
            matchTaskFilters[i] = (i.substring(1,i.length-1).match(taskFilters));
            tasksIndex[i] = "{{"+index+"}}";
            index++;
        });
        let replacedPStr = pStr;
        matchedTasks.forEach((i)=>replacedPStr=replacedPStr.replace(i, tasksIndex[i]));
        return [replacedPStr, tasksIndex];
    }

    return {parse: getPerspectiveFromString};
}();

