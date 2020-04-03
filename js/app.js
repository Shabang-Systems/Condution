// Chapter 1: Utilities!

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    let matches, substringRegex;

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

var smartParse = function(timeformat, timeString, o) {
    // smart, better date parsing with chrono
    let d = chrono.parse(timeString)[0].start.date();
    return {
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
        millisec: d.getMilliseconds(),
        microsec: d.getMicroseconds(),
        timezone: d.getTimezoneOffset() * -1
    };
}

// Chapter 2: Functions to Show and Hide Things!

var showPage = function(pageId) {
    $("#"+pageId).css("display", "block");
    $("#content-area").children().each(function(){
        let item = $(this)
        if (item.attr("id") != pageId){
           item.css("display", "none")
       }
    });
}

var isTaskActive = false;
var activeTask = null;

var hideActiveTask = function() {
    $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0"});
    $("#task-edit-"+activeTask).slideUp(300);
    $("#task-trash-"+activeTask).css("display", "none");
    $("#task-repeat-"+activeTask).css("display", "none");
    $("#task-"+activeTask).animate({"background-color": "#f4f4f4", "padding": "0", "margin":"0"}, 200);
    $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0"});
    isTaskActive = false;
    activeTask = null;
}

var displayTask = function(pageId, taskId) {
    // At this point, we shall pretend that we are querying the task from HuxZah's code
    let possibleProjects = {"TaskIdUUID1":"Synthesis", "TaskIdUUID2":"Paperwork"} 
    let actualProjectID = "TaskIdUUID1" 
    let taskNames = ["Z2_4: Second Pass", "Assignment Created - Optional: The Cartoon Guide to Chemistry Acid-Base / Equilibrium Readings, Foundations of Science", "science thursday presentation planned"]
    var name = taskNames[Math.floor(Math.random() * taskNames.length)];
    var desc = "A process by which Robert consumes items made of fabric."
    let defer = new Date(2020, 03, 19, 8, 32, 01, 01);
    let due = new Date(2020, 03, 19, 8, 32, 01, 01);
    let isFlagged = false
    let isFloating = true
    let possibleTags = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
      'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
      'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
      'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
      'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];
    let actualTags = ["Wyoming", "Alaska", "Hawaii"]
    // ---------------------------------------------------------------------------------
    // Parse and pre-write some DOMs
    let projectSelects = " " 
    for (let i in possibleProjects){
        projectSelects = projectSelects+"<option>"+possibleProjects[i]+"</option> "
    }
    let tagString = ""
    for (let i in actualTags){
        tagString = tagString+actualTags[i]+","
    }
    let actualProject = possibleProjects[actualProjectID];
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
                            <label class="task-pseudocheck" id="task-pseudocheck-${taskId}" for="task-check-${taskId}" style="font-family: 'Inter', sans-serif;">&zwnj;</label>
                            <input class="task-name" id="task-name-${taskId}" type="text" autocomplete="off" value="${name}">
                            <div class="task-trash task-subicon" id="task-trash-${taskId}" style="float: right; display: none;"><i class="fas fa-trash"></i></div>
                            <div class="task-repeat task-subicon" id="task-repeat-${taskId}" style="float: right; display: none;"><i class="fas fa-redo-alt"></i></div>
                        </div>
                        <div id="task-edit-${taskId}" class="task-edit" style="display:none">
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
    // ---------------------------------------------------------------------------------
    // Action Behaviors
    $('#task-check-'+taskId).change(function() {
        if (this.checked) {
            // Ask HuZah's code to complete the task
            $('#task-name-'+taskId).css("color","#ccccc");
            $('#task-name-'+taskId).css("text-decoration", "line-through");
            $('#task-pseudocheck-'+taskId).css("opacity", "0.6");
            $('#task-'+taskId).animate({"margin": "5px 0 5px 0"}, 200);
            $('#task-'+taskId).slideUp(150);
        }
    });
    $("#task-trash-"+taskId).click(function() {
        // Ask HuZah's code to delete the task
        console.log("o");
        hideActiveTask();
        $('#task-'+taskId).slideUp(150);
    });

}

// Chapter 3: Animation Listeners!!

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
})

$(document).on("click", ".task", function(e) {
    if($(this).attr('id')==="task-"+activeTask){
        e.stopImmediatePropagation();
        return;
    }
    if (isTaskActive){hideActiveTask();}
    if($(e.target).hasClass('task-pseudocheck') || $(e.target).hasClass('task-check')){
        e.stopImmediatePropagation();
        return;
    } else{
        isTaskActive = true;
        let taskInfo = $(this).attr("id").split("-")
        let task = taskInfo[taskInfo.length - 1];
        activeTask = task;
        $("#task-"+task).animate({"background-color": "#edeef2", "padding": "10px", "margin":"15px 0 30px 0"}, 300);
        $("#task-edit-"+activeTask).slideDown(200);
        $("#task-trash-"+activeTask).css("display", "block");
        $("#task-repeat-"+activeTask).css("display", "block");
        $("#task-"+task).css({"border-bottom": "2px solid #e5e6e8", "border-right": "2px solid #e5e6e8"});
    }
});

$(document).on("click", ".page, #left-menu div", function(e){
    if (isTaskActive){
        if($(e.target).hasClass("task-pseudocheck")) {
            $("#task-check-"+activeTask).toggle();
        } else if ($(e.target).hasClass('task') || $(e.target).hasClass('task-name')) {
            return false;
        }
        hideActiveTask();
    }
});

// Chapter 4: Eyecandy!
$("#greeting-date").html((new Date().toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })));

var greetings = ["Hello there,", "Hey,", "G'day,", "What's up,", "Howdy,", "Welcome,", "Guten Tag,"]
$("#greeting").html(greetings[Math.floor(Math.random() * greetings.length)]);

//$('.editable-select').editableSelect({
    //effects: 'fade',
    //duration: 200,
    //appendTo: 'body',
/*});*/


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


// Chapter 5: Demo Tasks!!

displayTask("inbox", "blahblahblah");
displayTask("inbox", "nochisimo");
displayTask("inbox", "nochisimo");
displayTask("inbox", "nochisimo");
displayTask("due-soon", "aeun");
displayTask("due-soon", "chaAchKACh");
displayTask("due-soon", "chaAchKACh");
displayTask("due-soon", "chaAchKACh");





//$(".task-displayname").after().click(function(e) {
    //var cont = window.getComputedStyle(
        //this, ':before'
    //)
    //console.log(e.target);
    //console.log(cont);
    //e.preventDefault();
//});

