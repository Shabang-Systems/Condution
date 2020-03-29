var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

var showPage = function(pageId) {
    $("#"+pageId).css("display", "block");
    $("#content-area").children().each(function(){
        let item = $(this)
        if (item.attr("id") != pageId){
           item.css("display", "none")
       }
    });
}

var displayTask = function(pageId, taskId) {
    // At this point, we shall pretend that we are querying the task from HuxZah's code
    var possibleProjects = {"TaskIdUUID1":"Synthesis", "TaskIdUUID2":"Paperwork"} 
    var actualProjectID = "TaskIdUUID1" 
    var name = "Consume fabric, Bob!"
    var desc = "A process by which Robert consumes items made of fabric."
    var defer = new Date(2020, 03, 19, 8, 32, 01, 01);
    var due = new Date(2020, 03, 19, 8, 32, 01, 01);
    var isFlagged = false
    var isFloating = true
    var possibleTags = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
      'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
      'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
      'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];
    var actualTags = ["Wyoming", "Alaska", "Hawaii"]
    // ---------------------------------------------------------------------------------
    // Parse and pre-write some DOMs
    var projectSelects = " " 
    for (var i in possibleProjects){
        projectSelects = projectSelects+"<option>"+possibleProjects[i]+"</option> "
    }
    var tagString = ""
    for (var i in actualTags){
        tagString = tagString+actualTags[i]+","
    }
    var actualProject = possibleProjects[actualProjectID];
    // Confused? The following sets the appearence of the checkboxes by manipulating active and checked
    if (isFlagged){
        var a1a = "";
        var a1b = "";
        var a2a = " active";
        var a2b = " checked";
    } else {
        var a1a = " active";
        var a1b = " checked";
        var a2a = "";
        var a2b = "";
    }
    if (isFloating){
        var b1a = "";
        var b1b = "";
        var b2a = " active";
        var b2b = " checked";
    } else {
        var b1a = " active";
        var b1b = " checked";
        var b2a = "";
        var b2b = "";
    }
    // ---------------------------------------------------------------------------------
    // Light the fire, kick the Tires!
    $("#"+pageId).append(`
                    <div id="task-${taskId}" class="task">
                        <div id="task-display-${taskId}" class="task-display" style="display:block">
                            <input type="checkbox" id="task-check-${taskId}" class="task-check"/>
                            <label class="task-displayname" id="task-displayname-${taskId}" for="task-check-${taskId}" style="font-family: 'Inter', sans-serif;">${name}</label>
                        </div>
                        <div id="task-edit-${taskId}" class="task-edit" style="display:none">
                            <div style="width:100%; overflow: hidden;">
                                <input class="task-name" id="task-name-${taskId}" type="text" autocomplete="off" style="margin-right: 20px" value="${name}">
                                <div class="task-trash" id="task-trash-${taskId}" style="float: right"><i class="fas fa-trash"></i></div>
                            </div>
                            <textarea class="task-desc" id="task-desc-${taskId}" type="text" autocomplete="off" placeholder="Description">${desc}</textarea>
                            <div class="task-tools" style="margin-bottom: 9px;">
                                <div class="label"><i class="fas fa-flag"></i></div>
                                <div class="btn-group btn-group-toggle task-flagged" id="task-flagged-${taskId}" data-toggle="buttons" style="margin-right: 20px">
                                    <label class="btn task-flagged${a1a}">
                                        <input type="radio" name="task-flagged" class="task-flagged-no" id="task-flagged-no-${taskId}"${a1b}> <i class="far fa-circle" style="transform:translateY(-4px)"></i>
                                    </label>
                                    <label class="btn task-flagged${a2a}">
                                        <input type="radio" name="task-flagged" class="task-flagged-yes" id="task-flagged-yes-${taskId}"${a2b}> <i class="fas fa-circle" style="transform:translateY(-4px)"></i>
                                    </label>
                                </div>
                                <div class="label"><i class="fas fa-globe-americas"></i></div>
                                <div class="btn-group btn-group-toggle task-floating" id="task-floating-${taskId}" data-toggle="buttons" style="margin-right: 14px">
                                    <label class="btn task-floating${b1a}">
                                        <input type="radio" name="task-floating" id="task-floating-no-${taskId}"${b1b}> <i class="far fa-circle" style="transform:translateY(-4px)"></i>
                                    </label>
                                    <label class="btn task-floating${b2a}">
                                        <input type="radio" name="task-floating" id="task-floating-yes-${taskId}"${b2b}> <i class="fas fa-circle" style="transform:translateY(-4px)"></i>
                                    </label>
                                </div>

                                <div class="label"><i class="far fa-play-circle"></i></div>
                                <input class="task-defer textbox datebox" id="task-defer-${taskId}" type="text" autocomplete="off" onfocus="this.blur()" style="margin-right: 10px">
                                <i class="fas fa-caret-right" style="color:#cccece; font-size:13px; transform: translateY(3px); margin-right: 5px"></i>
                                <div class="label"><i class="far fa-stop-circle"></i></div>
                                <input class="task-due textbox datebox" id="task-due-${taskId}" type="text" autocomplete="off" onfocus="this.blur()" style="margin-right: 20px">
                            </div>
                            <div class="task-tools">
                                <div class="label"><i class="fas fa-tasks"></i></div>
                                <select class="task-project textbox editable-select" id="task-project-${taskId}" style="margin-right: 14px">
                                    ${projectSelects}
                                </select>
                                <div class="label"><i class="fas fa-tags"></i></div>
                                <input class="task-tag textbox" id="task-tag-${taskId}" type="text" value="" onkeypress="this.style.width = ((this.value.length + 5) * 8) + 'px';" data-role="tagsinput" />
                            </div>
                        </div>
                    </div>
    `)
    // ---------------------------------------------------------------------------------
    // Set Dates!
    $("#task-defer-"+taskId).datetimepicker({
        timeInput: true,
        timeFormat: "hh:mm tt",
        showHour: false,
        showMinute: false,
    });
    $("#task-defer-"+taskId).datetimepicker('setDate', (defer));
    $("#task-due-"+taskId).datetimepicker({
        timeInput: true,
        timeFormat: "hh:mm tt",
        showHour: false,
        showMinute: false,
    });
    $("#task-due-"+taskId).datetimepicker('setDate', (due));
    // Set Tags!
    $('#task-tag-'+taskId).val(tagString);
    $('#task-tag-'+taskId).tagsinput({
        typeaheadjs: {
            name: 'tags',
            source: substringMatcher(possibleTags)
          }
    });
    $('#task-project-'+taskId).editableSelect({
        effects: 'fade',
        duration: 200,
        appendTo: 'body',
    });
    $('#task-project-'+taskId).val(actualProject);
}

var active = "today"

$(document).on('click', '.perspective', function(e) {
    $("#"+active).removeClass('today-highlighted perspective-selected')
    showPage("perspective-page")
    active = $(this).attr('id')
    if (active.includes("today")){
        $("#"+active).addClass("today-highlighted")
    } else if (active.includes("perspective")){
        $("#"+active).addClass("perspective-selected")
    }

    //console.log($(this).attr("id"));
    
})

$(document).on('click', '.today', function(e) {

    $("#"+active).removeClass('today-highlighted perspective-selected')
    showPage("upcoming-page")
    active = $(this).attr('id')
    if (active.includes("today")){
        $("#"+active).addClass("today-highlighted")
    } else if (active.includes("perspective")){
        $("#"+active).addClass("perspective-selected")
    }
    //console.log($(this).attr("id"));
})

$('.editable-select').editableSelect({
    effects: 'fade',
    duration: 200,
    appendTo: 'body',
});

function smartParse(timeformat, timeString, o) {
    // smart, better date parsing with chrono
    console.log("tes");
    var d = chrono.parse(timeString)[0].start.date();
    return {
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
        millisec: d.getMilliseconds(),
        microsec: d.getMicroseconds(),
        timezone: d.getTimezoneOffset() * -1
    };
}

//$('.datebox').datetimepicker({
    //timeInput: true,
    //timeFormat: "hh:mm tt",
	//showHour: false,
	//showMinute: false,
//});


//var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
      //'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
      //'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      //'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      //'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      //'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      //'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
      //'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      //'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    //];
//$('.task-tag').tagsinput({
  //typeaheadjs: {
    //name: 'states',
    //source: substringMatcher(states)
  //}
/*});*/

displayTask("upcoming-page", 02131);

var isTaskActive = false;
var activeTask = null;

$(document).on("dblclick", ".task-display", function(e) {
    isTaskActive = true;
    var taskInfo = $(this).attr("id").split("-")
    var task = taskInfo[taskInfo.length - 1];
    activeTask = task;
    $("#task-edit-"+task).css("display", "block");
    $("#task-display-"+task).css("display", "none");
});

$(document).click(function(e){
    if (isTaskActive){
        if( $(e.target).closest('#task-'+activeTask).length > 0 ) {
            return false;
        }
        $("#task-edit-"+activeTask).css("display", "none");
        $("#task-display-"+activeTask).css("display", "block");
        isTaskActive = false;
        activeTask = null;
    }
});

