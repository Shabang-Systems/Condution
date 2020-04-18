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
var interfaceUtil = function() {
    let Sortable = require('sortablejs')

    let getThemeColor = (colorName) => $("."+currentTheme).css(colorName);

    let substringMatcher = function(strings) {
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

    let smartParse = function(timeformat, timeString, o) {
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

    let numDaysBetween = function(d1, d2) {
        var diff = Math.abs(d1.getTime() - d2.getTime());
        return diff / (1000 * 60 * 60 * 24);
    };


    let calculateTaskHTML = function(taskId, name, desc, projectSelects, rightCarrotColor) {
        return `<div id="task-${taskId}" class="task"> <div id="task-display-${taskId}" class="task-display" style="display:block"> <input type="checkbox" id="task-check-${taskId}" class="task-check"/> <label class="task-pseudocheck" id="task-pseudocheck-${taskId}" for="task-check-${taskId}" style="font-family: 'Inter', sans-serif;">&zwnj;</label> <input class="task-name" id="task-name-${taskId}" type="text" autocomplete="off" value="${name}"> <div class="task-trash task-subicon" id="task-trash-${taskId}" style="float: right; display: none;"><i class="fas fa-trash"></i></div> <div class="task-repeat task-subicon" id="task-repeat-${taskId}" style="float: right; display: none;"><i class="fas fa-redo-alt"></i></div> </div> <div id="task-edit-${taskId}" class="task-edit" style="display:none"> <textarea class="task-desc" id="task-desc-${taskId}" type="text" autocomplete="off" placeholder="Description">${desc}</textarea> <div class="task-tools" style="margin-bottom: 9px;"> <div class="label"><i class="fas fa-flag"></i></div> <div class="btn-group btn-group-toggle task-flagged" id="task-flagged-${taskId}" data-toggle="buttons" style="margin-right: 20px"> <label class="btn task-flagged" id="task-flagged-no-${taskId}"> <input type="radio" name="task-flagged" class="task-flagged-no"> <i class="far fa-circle" style="transform:translateY(-4px)"></i> </label> <label class="btn task-flagged" id="task-flagged-yes-${taskId}"> <input type="radio" name="task-flagged" class="task-flagged-yes"> <i class="fas fa-circle" style="transform:translateY(-4px)"></i> </label> </div> <div class="label"><i class="fas fa-globe-americas"></i></div> <div class="btn-group btn-group-toggle task-floating" id="task-floating-${taskId}" data-toggle="buttons" style="margin-right: 14px"> <label class="btn task-floating" id="task-floating-no-${taskId}"> <input type="radio" name="task-floating"> <i class="far fa-circle" style="transform:translateY(-4px)"></i> </label> <label class="btn task-floating" id="task-floating-yes-${taskId}"> <input type="radio" name="task-floating"> <i class="fas fa-circle" style="transform:translateY(-4px)"></i> </label> </div> <div class="label"><i class="far fa-play-circle"></i></div> <input class="task-defer textbox datebox" id="task-defer-${taskId}" type="text" autocomplete="off" style="margin-right: 10px"> <i class="fas fa-caret-right" style="color:${rightCarrotColor}; font-size:13px; transform: translateY(3px); margin-right: 5px"></i> <div class="label"><i class="far fa-stop-circle"></i></div> <input class="task-due textbox datebox" id="task-due-${taskId}" type="text" autocomplete="off" style="margin-right: 20px"> </div> <div class="task-tools"> <div class="label"><i class="fas fa-tasks"></i></div> <select class="task-project textbox editable-select" id="task-project-${taskId}" style="margin-right: 14px"> ${projectSelects} </select> <div class="label"><i class="fas fa-tags"></i></div>
<input class="task-tag textbox" id="task-tag-${taskId}" type="text" value="" onkeypress="this.style.width = ((this.value.length + 5) * 8) + 'px';" data-role="tagsinput" /> </div> </div> </div>`
    }

    return {Sortable:Sortable, sMatch: substringMatcher, sp: smartParse, daysBetween: numDaysBetween, taskHTML: calculateTaskHTML, gtc: getThemeColor}
}();

var ui = function() {

    // greeting of the day
    let greetings = ["Hello there,", "Hey,", "What's up,", "Howdy,", "Welcome,", "Yo!"]
    let greeting = greetings[Math.floor(Math.random() * greetings.length)]

    // generic data containers used by refresh and others
    let pPandT, possibleProjects, possibleTags, possibleProjectsRev, possibleTagsRev;
    let inboxandDS;
    let avalibility;

    // current location
    let pageIndex = {
        currentView: "upcoming-page",
        projectDir: [],
        projectID: undefined
    }

    activeMenu = "today";

    // refresh data
    let refresh = async function(){
        pPandT = await getProjectsandTags(uid);
        possibleProjects = pPandT[0][0];
        possibleTags = pPandT[1][0];
        possibleProjectsRev = pPandT[0][1];
        possibleTagsRev = pPandT[1][1];
        avalibility = await getItemAvailability(uid);
        inboxandDS = await getInboxandDS(uid);
    }

    // the outside world's refresh function
    let reloadPage = async function() {
        setTimeout(function() {
            if (!activeTask) (loadView(pageIndex.currentView));
        }, 100);
    }

    // repeat view
    var showRepeat = function() {

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
                $(this).animate({"background-color": interfaceUtil.gtc("--background-feature")});
                repeatWeekDays = repeatWeekDays.filter(i => i !== $(this).html());
                modifyTask(uid, tid, {repeat: {rule: "weekly", on: repeatWeekDays}});
            } else {
                $(this).animate({"background-color": interfaceUtil.gtc("--decorative-light")});
                repeatWeekDays.push($(this).html());
                modifyTask(uid, tid, {repeat: {rule: "weekly", on: repeatWeekDays}});
            }
        });

        let repeatMonthDays = [];
        $(".repeat-monthgrid-day").on("click", function(e) {
            if (repeatMonthDays.includes($(this).html())) {
                $(this).animate({"background-color": interfaceUtil.gtc("--background")});
                repeatMonthDays = repeatMonthDays.filter(i => i !== $(this).html());
                modifyTask(uid, tid, {repeat: {rule: "monthly", on: repeatMonthDays}});
            } else {
                $(this).animate({"background-color": interfaceUtil.gtc("--background-feature")});
                repeatMonthDays.push($(this).html());
                modifyTask(uid, tid, {repeat: {rule: "monthly", on: repeatMonthDays}});
            }
        });

        let cr = async function(taskId) {
            $("#overlay").fadeIn(200).css("display", "flex").hide().fadeIn(200);
            $("#repeat-unit").fadeIn(200);
            let ti = await getTaskInformation(uid, taskId);
            $("#repeat-task-name").html(ti.name);
            tid = taskId;
            if (ti.repeat.rule !== "none") {
                if (ti.repeat.rule === "daily") {
                    $("#repeat-toggle-group").hide();
                    $("#repeat-type").html("every day.");
                    $("#repeat-type").show();
                } else if (ti.repeat.rule === "weekly") {
                    $("#repeat-daterow").children().each(function(e) {
                        if (ti.repeat.on.includes($(this).html)) {
                            $(this).animate({"background-color": interfaceUtil.gtc("--decorative-light")});
                            repeatMonthDays.push($(this).html());
                        }
                    });
                    let repeatWeekDays = ti.repeat.on;
                    $("#repeat-weekly-unit").show();
                    $("#repeat-toggle-group").hide();
                    $("#repeat-type").html("every week.");
                    $("#repeat-type").show();
                } else if (ti.repeat.rule === "monthly") {
                    $("#repeat-monthgrid").children().each(function(e) {
                        if (ti.repeat.on.includes($(this).html)) {
                            $(this).animate({"background-color": interfaceUtil.gtc("--background-feature")});
                        }
                    });
                    let repeatMonthDays = ti.repeat.on;
                    $("#repeat-monthly-unit").show();
                    $("#repeat-toggle-group").hide();
                    $("#repeat-type").html("every month.");
                    $("#repeat-type").show();
                } else if (ti.repeat.rule === "yearly") {
                    $("#repeat-toggle-group").hide();
                    $("#repeat-type").html("every year.");
                    $("#repeat-type").show();
                }
            }
        }
        return cr;
    }();

        // the pubilc refresh function

    let activeTask = null; // TODO: shouldn't this be undefined?
    let activeTaskDeInboxed = false;
    let activeTaskDeDsed = false;
    let activeTaskInboxed = false;


    // task methods!
    let taskManager = function() {
        //displayTask("inbox", task)

        let hideActiveTask = async function() {
            await refresh();
            $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0"});
            $("#task-edit-"+activeTask).slideUp(300);
            $("#task-trash-"+activeTask).css("display", "none");
            $("#task-repeat-"+activeTask).css("display", "none");
            $("#task-"+activeTask).animate({"background-color": interfaceUtil.gtc("--background"), "padding": "0", "margin":"0"}, 200);
            $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0", "box-shadow": "0 0 0"});
            if (activeTaskDeInboxed) {
                let hTask = activeTask;
                iC = inboxandDS[0].length;
                if (iC === 0) {
                    $("#inbox-subhead").slideUp(300);
                    $("#inbox").slideUp(300);
                } else {
                    $("#unsorted-badge").html(''+iC);
                    if (activeMenu==="today") {
                        $('#task-'+hTask).slideUp(200);
                    }
                }
            } else if (activeTaskDeDsed) {
                let hTask = activeTask;
                dsC = inboxandDS[1].length;
                if (dsC === 0) {
                    $("#ds-subhead").slideUp(300);
                    $("#due-soon").slideUp(300);
                } else {
                    $("#duesoon-badge").html(''+dsC);
                    if (activeMenu==="today" && $($('#task-'+hTask).parent()).attr('id') !== "inbox") {
                        $('#task-'+hTask).slideUp(200);
                    }
                }
            }

            if (activeTaskInboxed) {
                let hTask = activeTask;
                iC = inboxandDS[0].length;
                dsC = inboxandDS[1].length;
                $("#unsorted-badge").html(''+iC);
                $("#duesoon-badge").html(''+dsC);
                if (activeMenu==="today") {
                    $('#task-'+hTask).appendTo("#inbox");
                }
            }

            activeTaskDeInboxed = false;
            activeTaskDeDsed = false;
            activeTaskInboxed = false;
            activeTask = null;

            // that actually waits for the finishing of all animations...
            // JANKY!
         /*   setTimeout(function() {*/
                //if (!isTaskActive) loadView(currentPage)
            /*}, 500);*/
            reloadPage();
        }


        let displayTask = async function(pageId, taskId, sequentialOverride) {
            // Part 0: data gathering!
            // Get the task
            let taskObj = await getTaskInformation(uid, taskId);

            // Get info about the task
            let projectID = taskObj.project;
            let tagIDs = taskObj.tags;
            let isFlagged = taskObj.isFlagged;
            let isFloating = taskObj.isFloating;
            let name = taskObj.name;
            let desc = taskObj.desc;
            let timezone = taskObj.timezone;
            let repeat = taskObj.repeat;
            let defer;
            let due;
            if (taskObj.defer) {
                defer = new Date(taskObj.defer.seconds*1000);
            }
            if (taskObj.due) {
                due = new Date(taskObj.due.seconds*1000);
            }
            // ---------------------------------------------------------------------------------
            // Part 1: data parsing!
            // The Project
            let project = possibleProjects[projectID];
            // Project select options
            let projectSelects = " ";
            for (let i in possibleProjects) {
                projectSelects = projectSelects + "<option>" + possibleProjects[i] + "</option> ";
            }
            // Tag select options
            let possibleTagNames = function() {
                let res = [];
                for (let key in possibleTags) {
                    res.push(possibleTags[key]);
                }
                return res;
            }();
            // Actual tag string
            let tagString = "";
            for (let i in tagIDs) {
                tagString = tagString + possibleTags[tagIDs[i]] + ",";
            }
            // Calculate due date
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
            // The color of the carrot
            let rightCarrotColor = interfaceUtil.gtc("--decorative-light");
            // ---------------------------------------------------------------------------------
            // Part 2: the task!
            $("#" + pageId).append(interfaceUtil.taskHTML(taskId, name, desc, projectSelects, rightCarrotColor));
            // ---------------------------------------------------------------------------------
            // Part 3: customize the task!
            // Set the dates, aaaand set the date change trigger
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
            // Set tags!
            $('#task-tag-' + taskId).val(tagString);
            $('#task-tag-' + taskId).tagsinput({
                typeaheadjs: {
                    name: 'tags',
                    source: interfaceUtil.sMatch(possibleTagNames)
                }
            });
            // Set project!
            $('#task-project-' + taskId).editableSelect({
                effects: 'fade',
                duration: 200,
                appendTo: 'body',
            }).on('select.editable-select', function (e, li) {
                let projectSelected = li.text();
                let projId = possibleProjectsRev[projectSelected];
                if (project === undefined) {
                    activeTaskDeInboxed = true;
                } else {
                    dissociateTask(uid, taskId, projectID);
                }
                modifyTask(uid, taskId, {project:projId});
                projectID = projId;
                project = this.value;
                associateTask(uid, taskId, projId);
            });
            $('#task-project-' + taskId).val(project);
            // Set overdue style!
            if (due_current) {
                if (new Date() > due_current) {
                    $('#task-pseudocheck-' + taskId).addClass("od");
                } else if (interfaceUtil.daysBetween(new Date(), due_current) <= 1) {
                    $('#task-pseudocheck-' + taskId).addClass("ds");
                }
            }
            if (defer_current) {
                if (new Date() < defer_current) {
                    $('#task-name-' + taskId).css("opacity", "0.3");
                }
            }
            // Set avaliable Style
            if (!avalibility[taskId] && !sequentialOverride) {
                $('#task-name-' + taskId).css("opacity", "0.3");
            }
            // Set flagged style
            if (isFlagged) {
                $("#task-flagged-yes-"+taskId).button("toggle")
            } else {
                $("#task-flagged-no-"+taskId).button("toggle")
            }
            // Set floating style
            if (isFloating) {
                $("#task-floating-yes-"+taskId).button("toggle")
            } else {
                $("#task-floating-no-"+taskId).button("toggle")
            }
            // ---------------------------------------------------------------------------------
            // Part 4: task action behaviors!
            // Task complete
            $('#task-check-'+taskId).change(function(e) {
                if (this.checked) {
                    $('#task-name-' + taskId).css("color", interfaceUtil.gtc("--task-checkbox"));
                    $('#task-name-' + taskId).css("text-decoration", "line-through");
                    $('#task-pseudocheck-' + taskId).css("opacity", "0.6");
                    $('#task-' + taskId).animate({"margin": "5px 0 5px 0"}, 200);
                    $('#task-' + taskId).slideUp(300);
                    completeTask(uid, taskId).then(function(e) {
                        if (project === undefined) {
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
                    reloadPage();
                }
            });

            // Task project change
             $('#task-project-' + taskId).change(function(e) {
                if (this.value in possibleProjectsRev) {
                    let projId = possibleProjectsRev[this.value];
                    if (project === undefined){
                        activeTaskDeInboxed = true;
                    } else {
                        dissociateTask(uid, taskId, projectID);
                    }
                    modifyTask(uid, taskId, {project:projId});
                    projectID = projId;
                    project = this.value;
                    associateTask(uid, taskId, projId);
                } else {
                    modifyTask(uid, taskId, {project:""});
                    this.value = ""
                    if (project !== undefined) {
                        activeTaskInboxed = true;
                        dissociateTask(uid, taskId, projectID);
                    }
                    project = undefined;
                    projectID = "";
                }
            });

            // Trashing a task
            $("#task-trash-" + taskId).click(function(e) {
                if (project === undefined) activeTaskDeInboxed = true;
                deleteTask(uid, taskId).then(function() {
                    hideActiveTask();
                    $('#task-' + taskId).slideUp(150);
                });
            });

            // Repeat popover
            $("#task-repeat-" + taskId).click(function(e) {
                showRepeat(taskId);
            });

            // Task name change
            $("#task-name-" + taskId).change(function(e) {
                modifyTask(uid, taskId, {name:this.value});
            });

            // Task discription change
            $("#task-desc-" + taskId).change(function(e) {
                modifyTask(uid, taskId, {desc:this.value});
            });

            // Task tag remove
            $('#task-tag-' + taskId).on('itemRemoved', function(e) {
                let removedTag = possibleTagsRev[e.item];
                tagIDs = tagIDs.filter(item => item !== removedTag);
                modifyTask(uid, taskId, {tags:tagIDs});
            });

            // Task tag add
            $('#task-tag-' + taskId).on('itemAdded', function(e) {
                let addedTag = possibleTagsRev[e.item];
                if (!addedTag){
                    newTag(uid, e.item).then(function(addedTag) {
                        tagIDs.push(addedTag);
                        possibleTags[addedTag] = e.item;
                        possibleTags[e.item] = addedTag;
                        modifyTask(uid, taskId, {tags:tagIDs});
                    });
                } else if (!(addedTag in tagIDs)){
                    tagIDs.push(addedTag);
                    modifyTask(uid, taskId, {tags:tagIDs});
                }
            });

            // Remove flagged parametre
            $("#task-flagged-no-" + taskId).change(function(e) {
                isFlagged = false;
                modifyTask(uid, taskId, {isFlagged: false});
               // TODO: Unflagged Style? So far flagged is
               // just another filter for perspective selection
            });

            // Add flagged parametre
            $("#task-flagged-yes-" + taskId).change(function(e) {
                isFlagged = true;
                modifyTask(uid, taskId, {isFlagged: true});
               // TODO: Flagged Style?
            });

            // Remove floating parametre and calculate dates
            $("#task-floating-no-" + taskId).change(function(e) {
                isFloating = false;
                modifyTask(uid, taskId, {isFloating: false});
                defer_current = defer;
                due_current = due;
                setDates();
            });

            // Add floating parametre and calculate dates
            $("#task-floating-yes-" + taskId).change(function(e) {
                isFloating = true;
                modifyTask(uid, taskId, {isFloating: true});
                defer_current = moment(defer).tz(timezone).local(true).toDate();
                due_current = moment(due).tz(timezone).local(true).toDate();
                setDates();
            });

        }

        return {generateTaskInterface: displayTask, hideActiveTask: hideActiveTask};
    }();

    // sorters
    let sorters = function() {

        // inbox sorter
        let inboxSort = new interfaceUtil.Sortable($("#inbox")[0], {
            animation: 200,
            onEnd: function(e) {
                let oi = e.oldIndex;
                let ni = e.newIndex;
                refresh().then(function() {
                    if (oi<ni) {
                        // handle task moved down
                        for(let i=oi+1; i<=ni; i++) {
                            // move each task down in order
                            modifyTask(uid, inboxandDS[0][i], {order: i-1});
                        }
                        // change the order of the moved task
                        modifyTask(uid, inboxandDS[0][oi], {order: ni});
                    } else if (oi>ni) {
                        // handle task moved up
                        for(let i=oi-1; i>=ni; i--) {
                            // move each task up in order
                            modifyTask(uid, inboxandDS[0][i], {order: i+1});
                        }
                        // change the order of the moved task
                        modifyTask(uid, inboxandDS[0][oi], {order: ni});
                    }

                });
                reloadPage();
            }
        });

        // project sorter
        let projectSort = new interfaceUtil.Sortable($("#project-content")[0], {
            animation: 200,
            onEnd: function(e) {
                let oi = e.oldIndex;
                let ni = e.newIndex;

                getProjectStructure(uid, pid).then(async function(nstruct) {
                    if (oi<ni) {
                        // handle item moved down
                        for(let i=oi+1; i<=ni; i++) {
                            let child = nstruct.children[i];
                            // move the item down
                            if (child.type === "task") {
                                let id = child.content;
                                modifyTask(uid, id, {order: i-1});
                            } else if (child.type === "project") {
                                let id = child.content.id;
                                modifyProject(uid, id, {order: i-1});
                            }
                        }
                        // change the order of the moved item
                        let moved = nstruct.children[oi];
                        if (moved.type === "task") {
                            let id = moved.content;
                            modifyTask(uid, id, {order: ni});
                        } else if (moved.type === "project") {
                            let id = moved.content.id;
                            modifyProject(uid, id, {order: ni});
                        }
                    } else if (oi>ni) {
                        // handle item moved up
                        for(let i=oi-1; i>=ni; i--) {
                            let child = nstruct.children[i];
                            // move the item up
                            if (child.type === "task") {
                                let id = child.content;
                                modifyTask(uid, id, {order: i+1});
                            } else if (child.type === "project") {
                                let id = child.content.id;
                                modifyProject(uid, id, {order: i+1});
                            }
                        }
                        // change the order of the moved item
                        let moved = nstruct.children[oi];
                        if (moved.type === "task") {
                            let id = moved.content;
                            modifyTask(uid, id, {order: ni});
                        } else if (moved.type === "project") {
                            let id = moved.content.id;
                            modifyProject(uid, id, {order: ni});
                        }
                    }
                });
                reloadPage();
            }
        });


        // NW: perspective sorter
        var perspectiveSort = new interfaceUtil.Sortable($(".perspectives")[0], {
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

        // NW: top level project sorter
        let topLevelProjectSort = new interfaceUtil.Sortable($(".projects")[0], {
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

        return {inbox: inboxSort, project: projectSort, menuProject: topLevelProjectSort};
    }();

    // various sub-page loaders
    let viewLoader = function() {
        // this private function populates the view requested

        // upcoming view loader
        let upcoming = async function() {
            $("#greeting-date").html((new Date().toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })));
            $("#greeting").html(greeting);
            $("#greeting-name").html(displayName);

            Promise.all(
                // load inbox tasks
                inboxandDS[0].map(task => taskManager.generateTaskInterface("inbox", task)),
                // load due soon tasks
                inboxandDS[1].map(task => taskManager.generateTaskInterface("due-soon", task)),
            ).then(function() {
                // update upcoming view headers
                if (inboxandDS[0].length === 0) {
                    $("#inbox-subhead").hide();
                    $("#inbox").hide();
                } else {
                    $("#inbox-subhead").show();
                    $("#inbox").show();
                    $("#unsorted-badge").html('' + inboxandDS[0].length);
                }
                if (inboxandDS[1].length === 0) {
                    $("#ds-subhead").hide();
                    $("#due-soon").hide();
                } else {
                    $("#ds-subhead").show();
                    $("#due-soon").show();
                    $("#duesoon-badge").html('' + inboxandDS[1].length);
                }
            });
        }

        // project view loader
        let project = async function(pid) {
            // update pid
            pageIndex.projectID = pid;
            // get the datum
            let projectName = pPandT[0][0][pid];
            // update the titlefield
            $("#project-title").val(projectName);
            if (pageIndex.projectDir.length <= 1) {
                $("#project-back").hide()
            } else {
                $("#project-back").show()
            }
            // get the project structure, and load the content
            getProjectStructure(uid, pid).then(async function(struct) {
                for (let item of struct.children) {
                    if (item.type === "task") {
                        // get and load the task
                        let taskId = item.content;
                        await taskManager.generateTaskInterface("project-content", taskId);
                    } else if (item.type === "project") {
                        // get and load a project
                        let projID = item.content.id;
                        let projName = possibleProjects[projID];
                        $("#project-content").append(`<div id="project-${projID}" class="menuitem project subproject sbpro"><i class="far fa-arrow-alt-circle-right subproject-icon"></i><t style="padding-left:18px">${projName}</t></div>`);
                        if (!avalibility[projID]) {
                            $("#project-"+projID).css("opacity", "0.3");
                        }
                    }
                }
                if (struct.is_sequential) {
                    $("#project-sequential-yes").button("toggle")
                } else {
                    $("#project-sequential-no").button("toggle")
                }
            });
        }

        return {upcoming: upcoming, project: project};
    }();

    /**
     * async function load
     * load a view!
     *
     * @param viewName: well, which view?
     * @param itemID: if project/perspective, supply str ID
     * @returns {undefined}
     */
    let loadView = async function(viewName, itemID) {
        // hide other views
        $("#content-area").children().each(function() {
            if ($(this).attr("id") != viewName){
                $(this).css("display", "none");
            }
        });

        // clear all contentboxes
        $("#inbox").empty();
        $("#due-soon").empty();
        $("#project-content").empty();

        // refresh data
        await refresh();

        // load the dang view
        switch(viewName) {
            case 'upcoming-page':
                await viewLoader.upcoming();
                break;
            case 'project-page':
                await viewLoader.project(itemID);
                break;
        }

        // bring it!
        $("#"+viewName).show();

        // tell everyone to bring it!
        pageIndex.currentView = viewName;
    }

    // document action listeners!!
    $(document).on('click', '.menuitem', function(e) {
        $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
        activeMenu = $(this).attr('id');
        if (activeMenu.includes("perspective")) {
            loadView("perspective-page");
            $("#"+activeMenu).addClass("menuitem-selected");
        } else if (activeMenu.includes("project")) {
            if (!$(this).hasClass("subproject")) {
                pageIndex.projectDir = [];
            }
            pageIndex.projectDir.push(activeMenu);
            loadView("project-page", activeMenu.split("-")[1]);
            $("#"+activeMenu).addClass("menuitem-selected");
        }
    });

    $(document).on('click', '.today', function(e) {
        $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
        loadView("upcoming-page");
        activeMenu = $(this).attr('id');
        $("#"+activeMenu).addClass("today-highlighted");
    });

    $(document).on("click", ".task", async function(e) {
        if ($(this).attr('id') === "task-" + activeTask) {
            e.stopImmediatePropagation();
            return;
        }
        if (activeTask) await taskManager.hideActiveTask();
        if ($(e.target).hasClass('task-pseudocheck') || $(e.target).hasClass('task-check')) {
            e.stopImmediatePropagation();
            return;
        } else {
            let taskInfo = $(this).attr("id").split("-");
            let task = taskInfo[taskInfo.length - 1];
            activeTask = task;
            $("#task-" + task).animate({"background-color": interfaceUtil.gtc("--task-feature"), "padding": "10px", "margin": "15px 0 30px 0"}, 300);
            $("#task-edit-" + activeTask).slideDown(200);
            $("#task-trash-" + activeTask).css("display", "block");
            $("#task-repeat-" + activeTask).css("display", "block");
            $("#task-" + task).css({"box-shadow": "1px 1px 5px "+ interfaceUtil.gtc("--background-feature")});
        }
    });

    $(document).on("click", ".page, #left-menu div", function(e) {
        if (activeTask) {
            if ($(e.target).hasClass("task-pseudocheck")) {
                $("#task-check-"+activeTask).toggle();
            } else if ($(e.target).hasClass('task') || $(e.target).hasClass('task-name') || $(e.target).hasClass('task-display')) {
                return false;
            }
            taskManager.hideActiveTask();
        }
    });

    $(document).on("click", "#project-back", function() {
        // THE POP OPERATION IS NOT DUPLICATED.
        // On load, the current projDir will
        // be pushed to the array
        pageIndex.projectDir.pop()
        activeMenu = pageIndex.projectDir[pageIndex.projectDir.length-1]
        loadView("project-page", activeMenu.split("-")[1]);
    });

    $(document).on("click", "#new-project", function() {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let projObj = {
            top_level: false,
            is_sequential: false,
        }
        newProject(uid, projObj, pid).then(function(npID) {
            associateProject(uid, npID, pid);
            $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
            activeMenu = "project-"+npID;
            pageIndex.projectDir.push(activeMenu);
            loadView("project-page", npID).then(() => setTimeout(function() {$("#project-title").focus(); $("#project-title").select()}, 100));
            $("#"+activeMenu).addClass("menuitem-selected");
        });
    });

    $(document).on("click", "#project-add-toplevel", function() {
        let projObj = {
            name: "New Project",
            top_level: true,
            is_sequential: false,
        }
        newProject(uid, projObj).then(function(npID) {
            $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
            activeMenu = "project-"+npID;
            pageIndex.projectDir = [activeMenu];
            $(".projects").append(`<div id="project-${npID}" class="menuitem project mihov"><i class="fas fa-project-diagram"></i><t style="padding-left:8px">New Project</t></div>`);
            loadView("project-page", npID).then(function(){
                // Delay because of HTML bug
                setTimeout(function() {
                    $("#project-title").focus();
                    $("#project-title").select();
                }, 100);
            });
            $("#"+activeMenu).addClass("menuitem-selected");
        });
    });

    $(document).on("click", "#project-trash", function() {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let isTopLevel = pageIndex.projectDir.length === 1 ? true : false;
        deleteProject(uid, pid).then(function() {
            pageIndex.projectDir.pop()
            if (pageIndex.projectDir.length > 0) {
                dissociateProject(uid, pid, (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1]).then(function() {
                activeMenu = pageIndex.projectDir[pageIndex.projectDir.length-1];
                showPage("project-page", (pageIndex.projectDir.length-1).split("-")[1]);
                });
            } else {
                activeMenu = "today";
                $("#today").addClass("menuitem-selected");
                showPage("upcoming-page");
                $("#project-"+pid).remove();
            }

        });
    });

    $(document).on("click", "#new-task", function() {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1]
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
            taskManager.generateTaskInterface("project-content", ntID, true).then(function() {
                let task = ntID;
                activeTask = task;
                $("#task-" + task).animate({"background-color": interfaceUtil.gtc("--task-feature"), "padding": "10px", "margin": "15px 0 30px 0"}, 300);
                $("#task-edit-" + activeTask).slideDown(200);
                $("#task-trash-" + activeTask).css("display", "block");
                $("#task-repeat-" + activeTask).css("display", "block");
                $("#task-" + task).css({"box-shadow": "1px 1px 5px "+ interfaceUtil.gtc("--background-feature")});
                $("#task-name-" + task).focus();
            });
        });
    });

    $(document).on("change", "#project-title", function(e) {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1]
        let value = $(this).val();
        modifyProject(uid, pid, {name: value});
        $("#"+activeMenu+" t").html(value);
    });

    $(document).on("click", "#project-sequential-yes", function(e) {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1]
        modifyProject(uid, pid, {is_sequential: true}).then(function() {
            reloadPage();
        });
    });

    $(document).on("click", "#project-sequential-no", function(e) {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1]
        modifyProject(uid, pid, {is_sequential: false}).then(function() {
            reloadPage();
        });
    });

    $(document).on("click", "#logout", function(e) {
        firebase.auth().signOut().then(() => {}, console.error);
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
            tb.animate({"background-color": interfaceUtil.gtc("--quickadd-success"), "color": interfaceUtil.gtc("--content-normal-alt")}, function() {
                tb.animate({"background-color": interfaceUtil.gtc("--quickadd"), "color": interfaceUtil.gtc("--content-normal")})
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
                refresh().then(function(){
                    taskManager.generateTaskInterface("inbox", ntID)
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

    let user;
    let uid;
    let displayName;
    // TODO: actually set theme
    let currentTheme = "condutiontheme-default-light";

    let constructSidebar = async function() {
        let tlps = (await getTopLevelProjects(uid));
        let pPandT = (await getProjectsandTags(uid));
        for (let proj of tlps[2]) {
            $(".projects").append(`<div id="project-${proj.id}" class="menuitem project mihov"><i class="fas fa-project-diagram"></i><t style="padding-left:8px">${proj.name}</t></div>`);
        }
    }

    let setUser = function(usr) {
        user = usr;
        uid = usr.uid;
        displayName = usr.displayName;
        user = usr;
    }

    return {user:{set: setUser, get: ()=>user}, load: loadView, refresh: reloadPage, constructSidebar: constructSidebar};
}();

$(document).ready(async function() {
    firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            if (user.emailVerified) {
                const startTime = Date.now();
                console.log(`${(Date.now()-startTime) / 1000}: Email verified, preparing ui`);
                // User is signed in. Do user related things.
                currentTheme = "condutiontheme-exr0n-agressivedark";
                $("body").addClass(currentTheme);
                ui.user.set(user);
                console.log(`t+${(Date.now()-startTime) / 1000}: User set`);
                await ui.constructSidebar();
                console.log(`t+${(Date.now()-startTime) / 1000}: Sidebar constructed`);
                await ui.load("upcoming-page");
                console.log(`t+${(Date.now()-startTime) / 1000}: "Upcoming" loaded`);
                $("#loading").fadeOut();
                $("#content-wrapper").fadeIn();
                console.log(`t+${(Date.now()-startTime) / 1000}: Launched!`);
            }
        } else {
            window.location.replace("auth.html");
        }
    });
});

