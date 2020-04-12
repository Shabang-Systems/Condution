console.log("Initializing the galvanitizer!");

// Chapter 1: Utilities!
var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
        let matches, substringRegex;

        matches = [];
        substrRegex = new RegExp(q, 'i');
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

var numDaysBetween = function(d1, d2) {
    var diff = Math.abs(d1.getTime() - d2.getTime());
    return diff / (1000 * 60 * 60 * 24);
};

// Chapter 2: Functions to Show and Hide Things!
console.log("Defining the Dilly-Daller!");
var showPage = async function(pageId) {
    $("#content-area").children().each(function() {
        let item = $(this)
        if (item.attr("id") != pageId){
            item.css("display", "none")
        }
    });
    $("#page-loader").fadeIn(100);
    let pPandT = await getProjectsandTags(uid);
    let possibleProjects = pPandT[0][0];
    let possibleTags = pPandT[1][0];
    let possibleProjectsRev = pPandT[0][1];
    let possibleTagsRev = pPandT[1][1];
    if (pageId === "upcoming-page") {
        // Special home page loads
        $("#greeting-date").html((new Date().toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })));
        var greetings = ["Hello there,", "Hey,", "G'day,", "What's up,", "Howdy,", "Welcome,", "Yo!"]
        $("#greeting").html(greetings[Math.floor(Math.random() * greetings.length)]);
        $("#greeting-name").html(displayName);
        $("#inbox").empty();
        $("#due-soon").empty();

        await getInboxTasks(uid).then(async (elems) => { // TODO: what does function do?
            // hide the inbox if there are no unfinished tasks
            // TODO: test this function
            Promise.all(                                            // execute each promise in
                elems.map(element => displayTask(                    // get displayTask promise form each event
                    "inbox",
                    element,
                    [pPandT, possibleProjects, possibleTags, possibleProjectsRev, possibleTagsRev]
                ))
            ).then(() => {
                if (elems.length === 0) {
                    $("#inbox-subhead").hide();
                    $("#inbox").hide();
                } else {
                    $("#unsorted-badge").html('' + elems.length);
                }
                $("#page-loader").fadeOut(100);
                $("#"+pageId).fadeIn(200);
            });
        });
    } else {
        $("#"+pageId).empty();
        $("#page-loader").fadeOut(100);
        $("#"+pageId).fadeIn(200);
        // Sad normal perspective loads
        // TODO: implement query rules for perspectives
    }

}

var isTaskActive = false;
var activeTask = null; // TODO: shouldn't this be undefined?
var activeTaskDeInboxed = false;

var hideActiveTask = function() {
    $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0"});
    $("#task-edit-"+activeTask).slideUp(300);
    $("#task-trash-"+activeTask).css("display", "none");
    $("#task-repeat-"+activeTask).css("display", "none");
    $("#task-"+activeTask).animate({"background-color": "#f4f4f4", "padding": "0", "margin":"0"}, 200);
    $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0"});
    isTaskActive = false;
    activeTask = null;
    if (activeTaskDeInboxed) {
        getInboxTasks(uid).then(function(e){
            iC = e.length;
            if (iC === 0) {
                $("#inbox-subhead").slideUp(300);
                $("#inbox").slideUp(300);
            } else {
                $("#unsorted-badge").html(''+iC);
            }
        });
        activeTaskDeInboxed = false;
    }
}

var displayTask = async function(pageId, taskId, infoObj) {
    // At this point, we shall pretend that we are querying the task from HuxZah's code
    let taskObj = await getTaskInformation(uid, taskId);
    let pPandP = infoObj[0];
    let possibleProjects = infoObj[1];
    let possibleTags = infoObj[2];
    let possibleProjectsRev = infoObj[3];
    let possibleTagsRev = infoObj[4];
    let actualProjectID = taskObj.project;
    var name = taskObj.name;
    var desc = taskObj.desc;
    let timezone = taskObj.timezone;
    let defer = new Date(taskObj.defer.seconds*1000);
    let due = new Date(taskObj.due.seconds*1000);
    let isFlagged = taskObj.isFlagged;
    let isFloating = taskObj.isFloating;
    let actualTags = taskObj.tags;
    // ---------------------------------------------------------------------------------
    // Parse and pre-write some DOMs
    let projectSelects = " ";
    for (let i in possibleProjects) {
        projectSelects = projectSelects + "<option>" + possibleProjects[i] + "</option> ";
    }
    let tagString = "";
    for (let i in actualTags) {
        tagString = tagString + possibleTags[actualTags[i]] + ",";
    }
    let actualProject = possibleProjects[actualProjectID];
    let possibleTagNames = (() => {
        let res = [];
        for (let key in possibleTags) {
            res.push(possibleTags[key]);
        }
        return res;
    })();
    // Confused? The following sets the appearence of the checkboxes by manipulating active and checked
    if (isFlagged) {
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
    if (isFloating) {
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
    let defer_current;
    let due_current;
    if(isFloating) {
        defer_current = moment(defer).tz(timezone).local(true).toDate();
        due_current = moment(due).tz(timezone).local(true).toDate();
    } else {
        defer_current = defer;
        due_current = due;
    }
    // ---------------------------------------------------------------------------------
    // Light the fire, kick the Tires!
    $("#" + pageId).append(`
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
                                <input class="task-defer textbox datebox" id="task-defer-${taskId}" type="text" autocomplete="off" style="margin-right: 10px">
                                <i class="fas fa-caret-right" style="color:#cccece; font-size:13px; transform: translateY(3px); margin-right: 5px"></i>
                                <div class="label"><i class="far fa-stop-circle"></i></div>
                                <input class="task-due textbox datebox" id="task-due-${taskId}" type="text" autocomplete="off" style="margin-right: 20px">
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
    $("#task-defer-" + taskId).datetimepicker({
        timeInput: true,
        timeFormat: "hh:mm tt",
        showHour: false,
        showMinute: false,
        onSelect: function(e) {
            let defer_set = $(this).datetimepicker('getDate');
            let tz = moment.tz.guess();
            if (new Date() < defer_set) {
                $('#task-name-' + taskId).css("opacity", "0.3");
            } else {
                $('#task-name-' + taskId).css("opacity", "1");
            }
            modifyTask(uid, taskId, {defer:defer_set, timezone:tz});
            defer = defer_set;
        }
    });
    $("#task-due-" + taskId).datetimepicker({
        timeInput: true,
        timeFormat: "hh:mm tt",
        showHour: false,
        showMinute: false,
        onSelect: function(e) {
            let due_set = $(this).datetimepicker('getDate');
            let tz = moment.tz.guess();
            if (new Date() > due_set) {
                $('#task-pseudocheck-' + taskId).addClass("od");
                $('#task-pseudocheck-' + taskId).removeClass("ds");
            } else if (numDaysBetween(new Date(), due_set) <= 1) {
                $('#task-pseudocheck-' + taskId).addClass("ds");
                $('#task-pseudocheck-' + taskId).removeClass("od");
            } else {
                $('#task-pseudocheck-' + taskId).removeClass("od");
                $('#task-pseudocheck-' + taskId).removeClass("ds");
            }
            modifyTask(uid, taskId, {due:due_set, timezone:tz});
            due = due_set;
        }
    });
    // So apparently setting dates is hard for this guy, so we run this async
    let setDates = async () => { // TODO: why is this defined async when its so short and also called immmmedietely after wth
        $("#task-defer-" + taskId).datetimepicker('setDate', (defer_current));
        $("#task-due-" + taskId).datetimepicker('setDate', (due_current));
    };
    setDates();
    // Set Inputs!
    $('#task-tag-' + taskId).val(tagString);
    $('#task-tag-' + taskId).tagsinput({
        typeaheadjs: {
            name: 'tags',
            source: substringMatcher(possibleTagNames)
        }
    });
    $('#task-project-' + taskId).editableSelect({
        effects: 'fade',
        duration: 200,
        appendTo: 'body',
    }).on('select.editable-select', function (e, li) {
        let projectSelected = li.text();
        let projId = possibleProjectsRev[projectSelected];
        getTaskInformation(uid, taskId).then(function(e) {
            if (e.project === "") activeTaskDeInboxed = true;
        });
        modifyTask(uid, taskId, {project:projId});
    });
    $('#task-project-' + taskId).val(actualProject);
    // Style'em Good!
    if (new Date() > due_current) {
        $('#task-pseudocheck-' + taskId).addClass("od");
    } else if (numDaysBetween(new Date(), due_current) <= 1) {
        $('#task-pseudocheck-' + taskId).addClass("ds");
    } else if (new Date() < defer_current) {
        $('#task-name-' + taskId).css("opacity", "0.3");
    }
    // ---------------------------------------------------------------------------------
    // Action Behaviors
    $('#task-check-'+taskId).change(function(e) {
        if (this.checked) {
            completeTask(uid, taskId);
            // if (actualProject === "inbox") // TODO: do whatever this is?
            //      (if is a task is in the inbox and was just completed:
            //      drop the badge on the inbox)

            $('#task-name-' + taskId).css("color", "#ccccc");
            $('#task-name-' + taskId).css("text-decoration", "line-through");
            $('#task-pseudocheck-' + taskId).css("opacity", "0.6");
            $('#task-' + taskId).animate({"margin": "5px 0 5px 0"}, 200);
            $('#task-' + taskId).slideUp(150);
        }
    });
    $('#task-project-' + taskId).change(function(e) {
        if (this.value in possibleProjectsRev) {
            let projId = possibleProjectsRev[this.value];
            getTaskInformation(uid, taskId).then(function(e) {
                if (e.project === "") activeTaskDeInboxed = true;
            });
            modifyTask(uid, taskId, {project:projId});
        } else {
            modifyTask(uid, taskId, {project:""});
            this.value = ""
        }
    });
    $("#task-trash-" + taskId).click(function(e) {
        // Ask HuZah's code to delete the task
        hideActiveTask();
        $('#task-' + taskId).slideUp(150);
    });
    $("#task-name-" + taskId).change(function(e) {
        modifyTask(uid, taskId, {name:this.value});
    });
    $("#task-desc-" + taskId).change(function(e) {
        modifyTask(uid, taskId, {desc:this.value});
    });
    $('#task-tag-' + taskId).on('itemRemoved', function(e) {
        let removedTag = possibleTagsRev[e.item];
        actualTags = actualTags.filter(item => item !== removedTag);
        modifyTask(uid, taskId, {tags:actualTags});
    });
    $('#task-tag-' + taskId).on('itemAdded', function(e) {
        let addedTag = possibleTagsRev[e.item];
        if (!addedTag){
            newTag(uid, e.item).then(function(addedTag) {
                actualTags.push(addedTag);
                possibleTags[addedTag] = e.item;
                possibleTags[e.item] = addedTag;
                modifyTask(uid, taskId, {tags:actualTags});         
            });
        } else if (!(addedTag in actualTags)){
            actualTags.push(addedTag);
            modifyTask(uid, taskId, {tags:actualTags});
        }       
   });
   $("#task-flagged-no-" + taskId).change(function(e) {
        isFlagged = false;
        modifyTask(uid, taskId, {isFlagged: false});
       // TODO: Unflagged Style? So far flagged is
       // just another filter for perspective selection
   });
   $("#task-flagged-yes-" + taskId).change(function(e) {
        isFlagged = true;
        modifyTask(uid, taskId, {isFlagged: true});
       // TODO: Flagged Style?
   });
   $("#task-floating-no-" + taskId).change(function(e) {
        isFloating = false;
        modifyTask(uid, taskId, {isFloating: false});
        defer_current = defer;
        due_current = due;
        setDates();
   });
   $("#task-floating-yes-" + taskId).change(function(e) {
        isFloating = true;
        modifyTask(uid, taskId, {isFloating: true});
        defer_current = moment(defer).tz(timezone).local(true).toDate();
        due_current = moment(due).tz(timezone).local(true).toDate();
        setDates();
   });
}

// Chapter 3: Animation Listeners!!

console.log("Watching the clicky-pager!");
var active = "today";

$(document).on('click', '.perspective', function(e) {
    $("#"+active).removeClass('today-highlighted perspective-selected');
    showPage("perspective-page");
    active = $(this).attr('id');
    if (active.includes("today")) {
        $("#" + active).addClass("today-highlighted");
    } else if (active.includes("perspective")) {
        $("#"+active).addClass("perspective-selected");
    }
});

$(document).on('click', '.today', function(e) {
    $("#" + active).removeClass('today-highlighted perspective-selected');
    showPage("upcoming-page");
    active = $(this).attr('id');
    if (active.includes("today")) {
        $("#"+active).addClass("today-highlighted");
    } else if (active.includes("perspective")) {
        $("#"+active).addClass("perspective-selected");
    }
});

$(document).on("click", ".task", function(e) {
    if ($(this).attr('id') === "task-" + activeTask) {
        e.stopImmediatePropagation();
        return;
    }
    if (isTaskActive) hideActiveTask();
    if ($(e.target).hasClass('task-pseudocheck') || $(e.target).hasClass('task-check')) {
        e.stopImmediatePropagation();
        return;
    } else {
        isTaskActive = true;
        let taskInfo = $(this).attr("id").split("-");
        let task = taskInfo[taskInfo.length - 1];
        activeTask = task;
        $("#task-" + task).animate({"background-color": "#edeef2", "padding": "10px", "margin": "15px 0 30px 0"}, 300);
        $("#task-edit-" + activeTask).slideDown(200);
        $("#task-trash-" + activeTask).css("display", "block");
        $("#task-repeat-" + activeTask).css("display", "block");
        $("#task-" + task).css({"border-bottom": "2px solid #e5e6e8", "border-right": "2px solid #e5e6e8"});
    }
});

$(document).on("click", ".page, #left-menu div", function(e) {
    if (isTaskActive) {
        if ($(e.target).hasClass("task-pseudocheck")) {
            $("#task-check-"+activeTask).toggle();
        } else if ($(e.target).hasClass('task') || $(e.target).hasClass('task-name')) {
            return false;
        }
        hideActiveTask();
    }
});

$(document).on("click", "#logout", function(e) {
    firebase.auth().signOut().then(() => {}, console.error);
});

var displayName;
var uid;

var lightTheFire = async function() {
    await showPage("upcoming-page");
    $("#loading").hide();
    $("#content-wrapper").fadeIn();
    console.log("Kick the Tires!");
}

$(document).ready(function() {
    console.log("Authenticating the supergober!");

    // Check for Authentication
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if (user.emailVerified) {
                // User is signed in. Do user related things.
                displayName = user.displayName;
                uid = user.uid;
                console.log("Presenting the cuber-uber!");
                lightTheFire();
            }
        } else {
            window.location.replace("auth.html");
        }
    });
});

