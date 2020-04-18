console.log("Initializing the galvanitizer!");
const { remote } = require('electron');
const { Menu, MenuItem } = remote;

// TODO: apply themes to colors
// TODO: make a kickstarter
// Chapter 0: The Header.
if (process.platform === "win32") {
    $("#main-head-win32").show();
    $("#left-menu").addClass("win32-windowing");
    $("#content-area").addClass("win32-windowing");
    $("#window-minimize").click(()=>remote.BrowserWindow.getFocusedWindow().minimize());
    $("#window-maximize").click(function(e) {
        if (remote.BrowserWindow.getFocusedWindow().isMaximized()) {
            remote.BrowserWindow.getFocusedWindow().unmaximize();
        } else {
            remote.BrowserWindow.getFocusedWindow().maximize();
        }
    });
    $("#window-close").click(()=>remote.BrowserWindow.getFocusedWindow().close());
} else if (process.platform === "darwin") {
    $("#main-head-darwin").show();
    $("#left-menu").addClass("darwin-windowing-left");
    $("#content-area").addClass("darwin-windowing-right");
}

// Chapter 1: Utilities!
//import Sortable from 'sortablejs';
var Sortable = require('sortablejs')

var substringMatcher = function(strings) {
    return function findMatches(q, cb) {
        let matches, substrRegex;

        matches = [];
        substrRegex = new RegExp(q, 'i');
        $.each(strings, function(i, str) {
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


var getThemeColor = (colorName) => $("."+currentTheme).css(colorName);

var greetings = ["Hello there,", "Hey,", "G'day,", "What's up,", "Howdy,", "Welcome,", "Yo!"]
var greeting = greetings[Math.floor(Math.random() * greetings.length)]

// Chapter 2: Functions to Show and Hide Things!
var currentPage = "upcoming-page";
var projDir = [];
console.log("Defining the Dilly-Daller!");
var showPage = async function(pageId) {
    $("#content-area").children().each(function() {
        let item = $(this);
        if (item.attr("id") != pageId){
            item.css("display", "none")
        }
    });
    $("#inbox").empty();
    $("#due-soon").empty();
    $("#project-content").empty();

    let pPandT = await getProjectsandTags(uid);
    let possibleProjects = pPandT[0][0];
    let possibleTags = pPandT[1][0];
    let possibleProjectsRev = pPandT[0][1];
    let possibleTagsRev = pPandT[1][1];
    let avalibility = await getItemAvailability(uid);

    if (pageId === "upcoming-page") {
        // Special home page loads
        $("#greeting-date").html((new Date().toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })));
        $("#greeting").html(greeting);
        $("#greeting-name").html(displayName);
        await getInboxandDS(uid).then(async (elems) => {
            // hide the inbox if there are no unfinished tasks
            // TODO: test this function
            Promise.all(                                            // execute each promise in
                elems[0].map(element => displayTask(                    // get displayTask promise form each event
                    "inbox",
                    element,
                    [avalibility, possibleProjects, possibleTags, possibleProjectsRev, possibleTagsRev]
                )),
                elems[1].map(element => displayTask(                    // get displayTask promise form each event
                    "due-soon",
                    element,
                    [avalibility, possibleProjects, possibleTags, possibleProjectsRev, possibleTagsRev]
                )),
            ).then(() => {
                if (elems[0].length === 0) {
                    $("#inbox-subhead").hide();
                    $("#inbox").hide();
                } else {
                    $("#inbox-subhead").show();
                    $("#inbox").show();
                    $("#unsorted-badge").html('' + elems[0].length);
                }
                if (elems[1].length === 0) {
                    $("#ds-subhead").hide();
                    $("#due-soon").hide();
                } else {
                    $("#ds-subhead").show();
                    $("#due-soon").show();
                    $("#duesoon-badge").html('' + elems[1].length);
                }

                var inboxSort = new Sortable($("#inbox")[0], {
                    animation: 200,
                    onEnd: function(e) {
                        let oi = e.oldIndex;
                        let ni = e.newIndex;
                        getInboxTasks(uid).then(function(originalIBT) {
                            if (oi<ni) {
                                // Handle task moved down
                                for(let i=oi+1; i<=ni; i++) {
                                    modifyTask(uid, originalIBT[i], {order: i-1});
                                }
                                modifyTask(uid, originalIBT[oi], {order: ni});
                            } else if (oi>ni) {
                                // Handle task moved up
                                for(let i=oi-1; i>=ni; i--) {
                                    modifyTask(uid, originalIBT[i], {order: i+1});
                                }
                                modifyTask(uid, originalIBT[oi], {order: ni});
                            }

                        });
                        setTimeout(function() {
                            if (!isTaskActive) showPage(currentPage)
                        }, 100);
                    }
                });
                $("#"+pageId).show();
            });
        });
    } else if (pageId.includes("project")) {
        Promise.all([getProjectsandTags(uid), getItemAvailability(uid)]).then(function([pPandT, avalibility]){
            let pid = active.split("-")[1];
            let projectName = pPandT[0][0][pid];
            $("#project-title").val(projectName);
            let possibleProjects = pPandT[0][0];
            let possibleTags = pPandT[1][0];
            let possibleProjectsRev = pPandT[0][1];
            let possibleTagsRev = pPandT[1][1];
            if (projDir.length <= 1) {
                $("#project-back").hide()
            } else {
                $("#project-back").show()

            }


            getProjectStructure(uid, pid).then(async function(struct) {
                // Traditional for loop here INTENTIONAL
                // So that the items will load in correct order
                for (let item of struct.children) {
                    if (item.type === "task") {
                        let taskId = item.content;
                        await displayTask("project-content", taskId, [avalibility, possibleProjects, possibleTags, possibleProjectsRev, possibleTagsRev]);
                    } else if (item.type === "project") {
                        let projID = item.content.id;
                        let projName = possibleProjects[projID];
                        $("#project-content").append(`<div id="project-${projID}" class="menuitem project subproject sbpro"><i class="far fa-arrow-alt-circle-right subproject-icon"></i><t style="padding-left:18px">${projName}</t></div>`);
                        if (!avalibility[projID]) {
                            $("#project-"+projID).css("opacity", "0.3");
                        }
                    }
                }
               
                var projectSort = new Sortable($("#project-content")[0], {
                    animation: 200,
                    onEnd: function(e) {
                        let oi = e.oldIndex;
                        let ni = e.newIndex;
                        let pid = active.split("-")[1];

                        getProjectStructure(uid, pid).then(async function(nstruct) {
                            if (oi<ni) {
                                // Handle task moved down
                                for(let i=oi+1; i<=ni; i++) {
                                    let child = nstruct.children[i];
                                    if (child.type === "task") {
                                        let id = child.content;
                                        modifyTask(uid, id, {order: i-1});
                                    } else if (child.type === "project") {
                                        let id = child.content.id;
                                        modifyProject(uid, id, {order: i-1});
                                    }
                                }
                                let moved = nstruct.children[oi];
                                if (moved.type === "task") {
                                    let id = moved.content;
                                    modifyTask(uid, id, {order: ni});
                                } else if (moved.type === "project") {
                                    let id = moved.content.id;
                                    modifyProject(uid, id, {order: ni});
                                }
                            } else if (oi>ni) {
                                // Handle task moved up
                                for(let i=oi-1; i>=ni; i--) {
                                    let child = nstruct.children[i];
                                    if (child.type === "task") {
                                        let id = child.content;
                                        modifyTask(uid, id, {order: i+1});
                                    } else if (child.type === "project") {
                                        let id = child.content.id;
                                        modifyProject(uid, id, {order: i+1});
                                    }
                                }
                                let moved = nstruct.children[oi];
                                if (moved.type === "task") {
                                    let id = moved.content;
                                    modifyTask(uid, id, {order: ni});
                                } else if (moved.type === "project") {
                                    let id = moved.content.id;
                                    modifyProject(uid, id, {order: ni});
                                }
                                //modifyTask(uid, originalIBT[oi], {order: ni});
                            }
                        });
                        setTimeout(function() {
                            if (!isTaskActive) showPage(currentPage)
                        }, 100);
                    }
                });

                if (struct.is_sequential) {
                    $("#project-sequential-yes").button("toggle")
                } else {
                    $("#project-sequential-no").button("toggle")
                }



                $("#"+pageId).show();
            });
        });
    } else {
        //$("#"+pageId).empty();
        $("#"+pageId).show();
        // Sad normal perspective loads
        // TODO: implement query rules for perspectives
    }
    currentPage = pageId;
}

var isTaskActive = false;
var activeTask = null; // TODO: shouldn't this be undefined?
var activeTaskDeInboxed = false;
var activeTaskDeDsed = false;
var activeTaskInboxed = false;

var hideActiveTask = function() {
    $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0"});
    $("#task-edit-"+activeTask).slideUp(300);
    $("#task-trash-"+activeTask).css("display", "none");
    $("#task-repeat-"+activeTask).css("display", "none");
    $("#task-"+activeTask).animate({"background-color": getThemeColor("--background"), "padding": "0", "margin":"0"}, 200);
    $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0", "box-shadow": "0 0 0"});
    if (activeTaskDeInboxed) {
        let hTask = activeTask;
        getInboxTasks(uid).then(function(e){
            iC = e.length;
            if (iC === 0) {
                $("#inbox-subhead").slideUp(300);
                $("#inbox").slideUp(300);
            } else {
                $("#unsorted-badge").html(''+iC);
                if (active==="today") {
                    $('#task-'+hTask).slideUp(200);
                }
            }
        });
    } else if (activeTaskDeDsed) {
        let hTask = activeTask;
        getInboxandDS(uid).then(function(e){
            dsC = e[1].length;
            if (dsC === 0) {
                $("#ds-subhead").slideUp(300);
                $("#due-soon").slideUp(300);
            } else {
                $("#duesoon-badge").html(''+dsC);
                if (active==="today" && $($('#task-'+hTask).parent()).attr('id') !== "inbox") {
                    $('#task-'+hTask).slideUp(200);
                }
            }
        });
    }

    if (activeTaskInboxed) {
        let hTask = activeTask;
        getInboxandDS(uid).then(function(e){
            iC = e[0].length;
            dsC = e[1].length;
            $("#unsorted-badge").html(''+iC);
            $("#duesoon-badge").html(''+dsC);
            if (active==="today") {
                $('#task-'+hTask).appendTo("#inbox");
            }
        });
    }

    activeTaskDeInboxed = false;
    activeTaskDeDsed = false;
    activeTaskInboxed = false;
    isTaskActive = false;
    activeTask = null;

    // TODO: change reload the view after 5 secs to something
    // that actually waits for the finishing of all animations...
    // JANKY!
    setTimeout(function() {
        if (!isTaskActive) showPage(currentPage)
    }, 500);
}

var displayTask = async function(pageId, taskId, infoObj, sequentialOverride) {
    // At this point, we shall pretend that we are querying the task from HuxZah's code
    let taskObj = await getTaskInformation(uid, taskId);
    let avalibility = infoObj[0];
    let possibleProjects = infoObj[1];
    let possibleTags = infoObj[2];
    let possibleProjectsRev = infoObj[3];
    let possibleTagsRev = infoObj[4];
    let actualProjectID = taskObj.project;
    var name = taskObj.name;
    var desc = taskObj.desc;
    let timezone = taskObj.timezone;
    let defer;
    let due;
    if (!taskObj.defer) {
        defer = undefined;
    } else {
        defer = new Date(taskObj.defer.seconds*1000);
    }
    if (!taskObj.due) {
        due = undefined;
    } else {
        due = new Date(taskObj.due.seconds*1000);
    }
    let isFlagged = taskObj.isFlagged;
    let isFloating = taskObj.isFloating;
    let actualTags = taskObj.tags;
    let repeat = taskObj.repeat;
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
        if (defer) {
            defer_current = moment(defer).tz(timezone).local(true).toDate();
        } else {
            defer_current = undefined;
        }
        if (due) {
            due_current = moment(due).tz(timezone).local(true).toDate();
        } else {
            due_current = undefined;
        }
    } else {
        defer_current = defer;
        due_current = due;
    }
    let rightCarrotColor = getThemeColor("--decorative-light");
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
                                <i class="fas fa-caret-right" style="color:${rightCarrotColor}; font-size:13px; transform: translateY(3px); margin-right: 5px"></i>
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
                if ($('#task-pseudocheck-' + taskId).hasClass("ds") || $('#task-pseudocheck-' + taskId).hasClass("od")) {
                    activeTaskDeDsed = true;
                }
                $('#task-pseudocheck-' + taskId).removeClass("od");
                $('#task-pseudocheck-' + taskId).removeClass("ds");
            }
            modifyTask(uid, taskId, {due:due_set, timezone:tz});
            due = due_set;
        }
    });
    // So apparently setting dates is hard for this guy, so we run this async
    let setDates = async () => {
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
        if (actualProject === undefined) {
            activeTaskDeInboxed = true;
        } else {
            dissociateTask(uid, taskId, actualProjectID);
        }
        modifyTask(uid, taskId, {project:projId});
        actualProjectID = projId;
        actualProject = this.value;
        activeTaskChangedProject = true;
        associateTask(uid, taskId, projId);
    });
    $('#task-project-' + taskId).val(actualProject);
    // Style'em Good!
    if (due_current) {
        if (new Date() > due_current) {
            $('#task-pseudocheck-' + taskId).addClass("od");
        } else if (numDaysBetween(new Date(), due_current) <= 1) {
            $('#task-pseudocheck-' + taskId).addClass("ds");
        } 
    }
    if (defer_current) {
        if (new Date() < defer_current) {
            $('#task-name-' + taskId).css("opacity", "0.3");
        }
    }
    if (!avalibility[taskId] && !sequentialOverride) {
        $('#task-name-' + taskId).css("opacity", "0.3");
    }
    // ---------------------------------------------------------------------------------
    // Action Behaviors
    $('#task-check-'+taskId).change(function(e) {
        if (this.checked) {
            $('#task-name-' + taskId).css("color", getThemeColor("--task-checkbox"));
            $('#task-name-' + taskId).css("text-decoration", "line-through");
            $('#task-pseudocheck-' + taskId).css("opacity", "0.6");
            $('#task-' + taskId).animate({"margin": "5px 0 5px 0"}, 200);
            $('#task-' + taskId).slideUp(300);
            completeTask(uid, taskId).then(function(e) {
                if (actualProject === undefined) {
                     getInboxTasks(uid).then(function(e){
                        iC = e.length;
                        if (iC === 0) {
                            $("#inbox-subhead").slideUp(300);
                            $("#inbox").slideUp(300);
                        } else {
                            $("#unsorted-badge").html(''+iC);
                        }
                    });           
                }
            });
            if (repeat.rule !== "none" && due) {
                let rRule = repeat.rule;
                if (rRule === "daily") {
                    if (defer) {
                        let defDistance = due-defer;
                        due.setDate(due.getDate() + 1);
                        modifyTask(uid, taskId, {isComplete: false, due:due, defer:(due-defDistance)});
                    } else {
                        due.setDate(due.getDate() + 1);
                        modifyTask(uid, taskId, {isComplete: false, due:due});
                    }
                    
                } else if (rRule === "weekly") {
                    if (defer) {
                        let rOn = repeat.on;
                        let current = "";
                        let defDistance = due-defer;
                        while (!rOn.includes(current)) {
                            due.setDate(due.getDate() + 1);
                            let dow = due.getDay();
                            switch (dow) {
                                case 1:
                                    current = "M";
                                    break;
                                case 2:
                                    current = "Tu";
                                    break;
                                case 3:
                                    current = "W";
                                    break;
                                case 4:
                                    current = "Th";
                                    break;
                                case 5:
                                    current = "F";
                                    break;
                                case 6:
                                    current = "Sa";
                                    break;
                                case 7:
                                    current = "Su";
                                    break;
                            }
                        }
                        modifyTask(uid, taskId, {isComplete: false, due:due, defer:(due-defDistance)});
                    } else {
                        let rOn = repeat.on;
                        let current = "";
                        while (!rOn.includes(current)) {
                            due.setDate(due.getDate() + 1);
                            let dow = due.getDay();
                            switch (dow) {
                                case 1:
                                    current = "M";
                                    break;
                                case 2:
                                    current = "Tu";
                                    break;
                                case 3:
                                    current = "W";
                                    break;
                                case 4:
                                    current = "Th";
                                    break;
                                case 5:
                                    current = "F";
                                    break;
                                case 6:
                                    current = "Sa";
                                    break;
                                case 7:
                                    current = "Su";
                                    break;
                            }
                        }
                        modifyTask(uid, taskId, {isComplete: false, due:due});
                    }
                } else if (rRule === "monthly") {
                    if (defer) {
                        let rOn = repeat.on;
                        let dow = due.getDate();
                        let defDistance = due-defer;
                        while (!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (dow == 30 || dow == 30))) {
                            due.setDate(due.getDate() + 1);
                            dow = due.getDate();
                        }
                        modifyTask(uid, taskId, {isComplete: false, due:due, defer:(due-defDistance)});
                    } else {
                        let rOn = repeat.on;
                        let dow = due.getDate();
                        while (!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (dow == 31 || dow == 30))) {
                            due.setDate(due.getDate() + 1);
                            dow = due.getDate();
                        }
                        modifyTask(uid, taskId, {isComplete: false, due:due});
                    }
                } else if (rRule === "yearly") {
                    if (defer) {
                        let defDistance = due-defer;
                        due.setFullYear(due.getFullYear() + 1);
                        modifyTask(uid, taskId, {isComplete: false, due:due, defer:(due-defDistance)});
                    } else {
                        due.setFullYear(due.getFullYear() + 1);
                        modifyTask(uid, taskId, {isComplete: false, due:due});
                    }
                    
                } 
            }
            setTimeout(function() {
                if (!isTaskActive) showPage(currentPage)
            }, 100);
        }
    });
    $('#task-project-' + taskId).change(function(e) {
        if (this.value in possibleProjectsRev) {
            let projId = possibleProjectsRev[this.value];
            if (actualProject === undefined){
                activeTaskDeInboxed = true;
            } else {
                dissociateTask(uid, taskId, actualProjectID);
            }
            modifyTask(uid, taskId, {project:projId});
            actualProjectID = projId;
            actualProject = this.value;
            associateTask(uid, taskId, projId);
            activeTaskChangedProject = true;
        } else {
            modifyTask(uid, taskId, {project:""});
            this.value = ""
            if (actualProject !== undefined) {
                activeTaskInboxed = true;
                dissociateTask(uid, taskId, actualProjectID);
            }
            actualProject = undefined;
            actualProjectID = "";
        }
    });
    $("#task-trash-" + taskId).click(function(e) {
        if (actualProject === undefined) activeTaskDeInboxed = true;
        deleteTask(uid, taskId).then(function() {
            hideActiveTask();
            $('#task-' + taskId).slideUp(150);
        });
    });
    $("#task-repeat-" + taskId).click(function(e) {
        showRepeat(taskId);
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

var showRepeat;
(function() {

    let tid;

    // Setup repeat things!
    $("#repeat-back").on("click", function(e) {
        $(".repeat-subunit").slideUp();
        $("#repeat-toggle-group").slideDown();
        $("#repeat-type").fadeOut(()=>$("#repeat-type").html(""));
        $("#repeat-unit").fadeOut(200);
        $("#overlay").fadeOut(200);
    });

    $("#overlay").on("click", function(e) {
        if (e.target === this) {
            $(".repeat-subunit").slideUp();
            $("#repeat-toggle-group").slideDown();
            $("#repeat-type").fadeOut(()=>$("#repeat-type").html(""));
            $("#repeat-unit").fadeOut(200);
            $("#overlay").fadeOut(200);
        }
    });

    $("#repeat-type").on("click", function(e) {
        $(".repeat-subunit").slideUp();
        $("#repeat-toggle-group").slideDown();
        $("#repeat-type").fadeOut(()=>$("#repeat-type").html(""));
        modifyTask(uid, tid, {repeat: {rule: "none"}});
    });

    $("#repeat-perday").on("click", function(e) {
        $("#repeat-toggle-group").slideUp();
        $("#repeat-type").html("every day.");
        $("#repeat-type").fadeIn();
        modifyTask(uid, tid, {repeat: {rule: "daily"}});
    });

    $("#repeat-perweek").on("click", function(e) {
        $("#repeat-weekly-unit").slideDown();
        $("#repeat-toggle-group").slideUp();
        $("#repeat-type").html("every week.");
        $("#repeat-type").fadeIn();
    });

    $("#repeat-permonth").on("click", function(e) {
        $("#repeat-monthly-unit").slideDown();
        $("#repeat-toggle-group").slideUp();
        $("#repeat-type").html("every month.");
        $("#repeat-type").fadeIn();
    });

    $("#repeat-peryear").on("click", function(e) {
        $("#repeat-toggle-group").slideUp();
        $("#repeat-type").html("every year.");
        $("#repeat-type").fadeIn();
        modifyTask(uid, tid, {repeat: {rule: "yearly"}});
    });

    // Actions
    let repeatWeekDays = [];
    $(".repeat-daterow-weekname").on("click", function(e) {
        if (repeatWeekDays.includes($(this).html())) {
            $(this).animate({"background-color": getThemeColor("--background-feature")});
            repeatWeekDays = repeatWeekDays.filter(i => i !== $(this).html());
            modifyTask(uid, tid, {repeat: {rule: "weekly", on: repeatWeekDays}});
        } else {
            $(this).animate({"background-color": getThemeColor("--decorative-light")});
            repeatWeekDays.push($(this).html());
            modifyTask(uid, tid, {repeat: {rule: "weekly", on: repeatWeekDays}});
        }
    });

    let repeatMonthDays = [];
    $(".repeat-monthgrid-day").on("click", function(e) {
        if (repeatMonthDays.includes($(this).html())) {
            $(this).animate({"background-color": getThemeColor("--background")});
            repeatMonthDays = repeatMonthDays.filter(i => i !== $(this).html());
            modifyTask(uid, tid, {repeat: {rule: "monthly", on: repeatMonthDays}});
        } else {
            $(this).animate({"background-color": getThemeColor("--background-feature")});
            repeatMonthDays.push($(this).html());
            modifyTask(uid, tid, {repeat: {rule: "monthly", on: repeatMonthDays}});
        }
    });

    showRepeat = async function(taskId) {
        $("#overlay").fadeIn(200).css("display", "flex").hide().fadeIn(200);
        $("#repeat-unit").fadeIn(200);
        let ti = await getTaskInformation(uid, taskId);
        $("#repeat-task-name").html(ti.name);
        tid = taskId;
    }
    
}());

// Chapter 3: Animation Listeners!!

console.log("Watching the clicky-pager!");
var active = "today";
var activeName = "Upcoming";

$(document).on('click', '.menuitem', function(e) {
    $("#"+active).removeClass('today-highlighted menuitem-selected');
    active = $(this).attr('id');
    if (active.includes("perspective")) {
        showPage("perspective-page");
        $("#"+active).addClass("menuitem-selected");
    } else if (active.includes("project")) {
        if (!$(this).hasClass("subproject")) {
            projDir = [];
        }
        projDir.push(active);
        showPage("project-page");
        $("#"+active).addClass("menuitem-selected");
    }
});

$(document).on('click', '.today', function(e) {
    $("#" + active).removeClass('today-highlighted menuitem-selected');
    showPage("upcoming-page");
    active = $(this).attr('id');
    $("#"+active).addClass("today-highlighted");
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
        $("#task-" + task).animate({"background-color": getThemeColor("--task-feature"), "padding": "10px", "margin": "15px 0 30px 0"}, 300);
        $("#task-edit-" + activeTask).slideDown(200);
        $("#task-trash-" + activeTask).css("display", "block");
        $("#task-repeat-" + activeTask).css("display", "block");
        $("#task-" + task).css({"box-shadow": "1px 1px 5px "+getThemeColor("--background-feature")});
    }
});

$(document).on("click", ".page, #left-menu div", function(e) {
    if (isTaskActive) {
        if ($(e.target).hasClass("task-pseudocheck")) {
            $("#task-check-"+activeTask).toggle();
        } else if ($(e.target).hasClass('task') || $(e.target).hasClass('task-name') || $(e.target).hasClass('task-display')) {
            return false;
        }
        hideActiveTask();
    }
});

$(document).on("click", "#logout", function(e) {
    firebase.auth().signOut().then(() => {}, console.error);
});

$(document).on("click", "#project-back", function() {
    // THE POP OPERATION IS NOT DUPLICATED.
    // On load, the current projDir will
    // be pushed to the array
    projDir.pop()
    active = projDir[projDir.length-1]
    showPage("project-page");
});

$(document).on("click", "#new-project", function() {
    let pid = (projDir[projDir.length-1]).split("-")[1];
    let projObj = {
        top_level: false,
        is_sequential: false,
    }
    newProject(uid, projObj, pid).then(function(npID) {
        associateProject(uid, npID, pid);
        $("#"+active).removeClass('today-highlighted menuitem-selected');
        active = "project-"+npID;
        projDir.push(active);
        showPage("project-page").then(() => setTimeout(function() {$("#project-title").focus(); $("#project-title").select()}, 100));
        $("#"+active).addClass("menuitem-selected");
    });
});

$(document).on("click", "#project-add-toplevel", function() {
    let projObj = {
        name: "New Project",
        top_level: true,
        is_sequential: false,
    }
    newProject(uid, projObj).then(function(npID) {
        $("#"+active).removeClass('today-highlighted menuitem-selected');
        active = "project-"+npID;
        projDir = [active];
        $(".projects").append(`<div id="project-${npID}" class="menuitem project mihov"><i class="fas fa-project-diagram"></i><t style="padding-left:8px">New Project</t></div>`);
        showPage("project-page").then(function(){
            // Delay because of HTML bug
            setTimeout(function() {
                $("#project-title").focus();
                $("#project-title").select();
            }, 100);
        });
        $("#"+active).addClass("menuitem-selected");
    });
});

$(document).on("click", "#project-trash", function() {
    let pid = (projDir[projDir.length-1]).split("-")[1];
    let isTopLevel = projDir.length === 1 ? true : false;
    deleteProject(uid, pid).then(function() {
        projDir.pop()
        if (projDir.length > 0) {
            dissociateProject(uid, pid, (projDir[projDir.length-1]).split("-")[1]).then(function() {
            active = projDir[projDir.length-1];
            showPage("project-page");
            });
        } else {
            active = "today";
            $("#today").addClass("menuitem-selected");
            showPage("upcoming-page");
            $("#project-"+pid).remove();
        }

    });
});


$(document).on("click", "#new-task", function() {
    let pid = (projDir[projDir.length-1]).split("-")[1]
    let ntObject = {
        desc: "",
        isFlagged: false,
        isFloating: false,
        isComplete: false,
        project: pid,
        tags: [],
        timezone: moment.tz.guess(), 
        name: "",
    };
    newTask(uid, ntObject).then(function(ntID) {
        associateTask(uid, ntID, pid);
        Promise.all([getProjectsandTags(uid), getItemAvailability(uid)]).then(function([pPandT, avalibility]){
            let possibleProjects = pPandT[0][0];
            let possibleTags = pPandT[1][0];
            let possibleProjectsRev = pPandT[0][1];
            let possibleTagsRev = pPandT[1][1];
            displayTask("project-content", ntID, [avalibility, possibleProjects, possibleTags, possibleProjectsRev, possibleTagsRev], true).then(function() {
                isTaskActive = true;
                let task = ntID;
                activeTask = task;
                $("#task-" + task).animate({"background-color": getThemeColor("--task-feature"), "padding": "10px", "margin": "15px 0 30px 0"}, 300);
                $("#task-edit-" + activeTask).slideDown(200);
                $("#task-trash-" + activeTask).css("display", "block");
                $("#task-repeat-" + activeTask).css("display", "block");
                $("#task-" + task).css({"box-shadow": "1px 1px 5px "+getThemeColor("--background-feature")});  
                $("#task-name-" + task).focus();
            });
        });
    });
});

$(document).on("change", "#project-title", function(e) {
    let pid = (projDir[projDir.length-1]).split("-")[1]
    let value = $(this).val();        
    modifyProject(uid, pid, {name: value});
    $("#"+active+" t").html(value);
});

$(document).on("click", "#project-sequential-yes", function(e) {
    let pid = (projDir[projDir.length-1]).split("-")[1]
    modifyProject(uid, pid, {is_sequential: true}).then(function() {
        setTimeout(function() {
            if (!isTaskActive) showPage(currentPage)
        }, 100);
    });
});

$(document).on("click", "#project-sequential-no", function(e) {
    let pid = (projDir[projDir.length-1]).split("-")[1]
    modifyProject(uid, pid, {is_sequential: false}).then(function() {
        setTimeout(function() {
            if (!isTaskActive) showPage(currentPage)
        }, 100);
    });
});

var perspectiveSort = new Sortable($(".perspectives")[0], {
    animation: 200,
    onStart: function(e) {
        // Make sure that elements don't think that they are being hovered
        // when they are being dragged over
        let itemEl = $(e.item);
        $('.perspectives').children().each(function() {
            if ($(this) !== itemEl) {
                $(this).removeClass("mihov")
            }
        })
	},
    onEnd: function(e) {
        $('.perspectives').children().each(function() {
            // Aaand make elements hoverable after they've been dragged over
            $(this).addClass("mihov")
        })
    }

});

var topLevelProjectSort = new Sortable($(".projects")[0], {
    animation: 200,
    onStart: function(e) {
        // Make sure that elements don't think that they are being hovered
        // when they are being dragged over
        let itemEl = $(e.item);
        $('.projects').children().each(function() {
            if ($(this) !== itemEl) {
                $(this).removeClass("mihov")
            }
        })
	},
     onEnd: function(e) {
        let oi = e.oldIndex;
        let ni = e.newIndex;
        getTopLevelProjects(uid).then(function(topLevelItems) {
            let originalIBT = topLevelItems[2].map(i => i.id);
            if (oi<ni) {
                // Handle task moved down
                for(let i=oi+1; i<=ni; i++) {
                    modifyProject(uid, originalIBT[i], {order: i-1});
                }
                modifyProject(uid, originalIBT[oi], {order: ni});
            } else if (oi>ni) {
                // Handle task moved up
                for(let i=oi-1; i>=ni; i--) {
                    modifyProject(uid, originalIBT[i], {order: i+1});
                }
                modifyProject(uid, originalIBT[oi], {order: ni});
            }


        });
    }
});

$("#quickadd").click(function(e) {
    $(this).animate({"width": "350px"}, 500);
});

$("#quickadd").blur(function(e) {
    $(this).val("");
    $(this).animate({"width": "250px"}, 500);
});

$("#quickadd").keydown(function(e) {
    if (e.keyCode == 13) {
        let tb = $(this);
        tb.animate({"background-color": getThemeColor("--quickadd-success"), "color": getThemeColor("--content-normal-alt")}, function() {
            tb.animate({"background-color": getThemeColor("--quickadd"), "color": getThemeColor("--content-normal")})   
        });
        let newTaskUserRequest = chrono.parse($(this).val());
        // TODO: so this dosen't actively watch for the word "DUE", which is a problem.
        // Make that happen is the todo.
        let startDate;
        let endDate;
        let tz = moment.tz.guess();
        let ntObject = {
            desc: "",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: "",
            tags: [],
            timezone: tz, 
        };
        if (newTaskUserRequest.length != 0) {
            let start = newTaskUserRequest[0].start;
            let end = newTaskUserRequest[0].end;
            if (start && end) {
                startDate = start.date();
                endDate = end.date();
                ntObject.defer = startDate;
                ntObject.due = endDate;
            } else if (end) {
                endDate = end.date();
                ntObject.due = endDate;
            } else if (start) {
                startDate = start.date();
                ntObject.defer = startDate;
            }
            ntObject.name = tb.val().replace(newTaskUserRequest[0].text, '')
        } else {
            ntObject.name = tb.val()
        }

        newTask(uid, ntObject).then(function(ntID) {
            Promise.all([getProjectsandTags(uid), getItemAvailability(uid)]).then(function([pPandT, avalibility]){
                let possibleProjects = pPandT[0][0];
                let possibleTags = pPandT[1][0];
                let possibleProjectsRev = pPandT[0][1];
                let possibleTagsRev = pPandT[1][1];
                displayTask("inbox", ntID, [avalibility, possibleProjects, possibleTags, possibleProjectsRev, possibleTagsRev])
            });
            getInboxTasks(uid).then(function(e){
                iC = e.length;
                $("#unsorted-badge").html(''+iC);
                $("#inbox-subhead").slideDown(300);
                $("#inbox").slideDown(300);
            });
            tb.blur();
            tb.val("");
        })
    } else if (e.keyCode == 27) {
        $(this).blur();
    }
});


// Chapter 4: Interface Loader Functions
var loadProjects = async function() {
    let tlps = (await getTopLevelProjects(uid));
    let pPandT = (await getProjectsandTags(uid));
    for (let proj of tlps[2]) {
        $(".projects").append(`<div id="project-${proj.id}" class="menuitem project mihov"><i class="fas fa-project-diagram"></i><t style="padding-left:8px">${proj.name}</t></div>`);
    }
}

// Chapter 5: Keyboard Shortcuts
/*Mousetrap.bind(['command+r', 'ctrl+r'], function() {*/
    //showPage(currentPage);
    //return false;
    //// TODO: bind command r to not actuall reload on production
//});


// Chapter 6: Mainloop
var lightTheFire = async function() {
    $("body").addClass(currentTheme);
    await showPage("upcoming-page");
    await loadProjects();
    $("#loading").hide();
    $("#content-wrapper").fadeIn();
    console.log("Kick the Tires!");
}

var uid;
var displayName;
var currentTheme;

$(document).ready(function() {
    console.log("Authenticating the supergober!");

    // Check for Authentication
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if (user.emailVerified) {
                // User is signed in. Do user related things.
                displayName = user.displayName;
                uid = user.uid;
                // TODO: actually get the user's prefrences
                currentTheme = "condutiontheme-default-light";
                console.log("Presenting the cuber-uber!");
                lightTheFire();
            }
        } else {
            window.location.replace("auth.html");
        }
    });
});

