/* Query the system dark theme, and load the appropriate theme */

if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
    currentTheme = "condutiontheme-default-dark";
    $("body").removeClass();
    $("body").addClass(currentTheme);
}
else {
    currentTheme = "condutiontheme-default-light";
    $("body").removeClass();
    $("body").addClass(currentTheme);
}

lottie.loadAnimation({
    container: $("#loading-anim")[0],
    renderer: 'svg',
    autoplay: true,
    path: 'static/loadanim.json'
})
$("#loading-msg").hide();
$("#loading").hide().css("display", "flex").fadeIn();

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
const interfaceUtil = function() {
    const Sortable = require('sortablejs');

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

    const smartParse = function(timeformat, timeString, o) {
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
    };

    const smartParseFull = (timeString) => chrono.parse(timeString)[0];

    const numDaysBetween = function(d1, d2) {
        let diff = Math.abs(d1.getTime() - d2.getTime());
        return diff / (1000 * 60 * 60 * 24);
    };


    let calculateTaskHTML = function(taskId, name, desc, projectSelects, rightCarrotColor) {
        return `<div id="task-${taskId}" class="task"> <div id="task-display-${taskId}" class="task-display" style="display:block"> <input type="checkbox" id="task-check-${taskId}" class="task-check"/> <label class="task-pseudocheck" id="task-pseudocheck-${taskId}" for="task-check-${taskId}" style="font-family: 'Inter', sans-serif;">&zwnj;</label> <input class="task-name" id="task-name-${taskId}" type="text" autocomplete="off" value="${name}"> <div class="task-trash task-subicon" id="task-trash-${taskId}" style="float: right; display: none;"><i class="fas fa-trash"></i></div> <div class="task-repeat task-subicon" id="task-repeat-${taskId}" style="float: right; display: none;"><i class="fas fa-redo-alt"></i></div> </div> <div id="task-edit-${taskId}" class="task-edit" style="display:none"> <textarea class="task-desc" id="task-desc-${taskId}" type="text" autocomplete="off" placeholder="Description">${desc}</textarea> <div class="task-tools" style="margin-bottom: 9px;"> <div class="label"><i class="fas fa-flag"></i></div> <div class="btn-group btn-group-toggle task-flagged" id="task-flagged-${taskId}" data-toggle="buttons" style="margin-right: 20px !important"> <label class="btn task-flagged" id="task-flagged-no-${taskId}"> <input type="radio" name="task-flagged" class="task-flagged-no"> <i class="far fa-circle" style="transform:translateY(-4px)"></i> </label> <label class="btn task-flagged" id="task-flagged-yes-${taskId}"> <input type="radio" name="task-flagged" class="task-flagged-yes"> <i class="fas fa-circle" style="transform:translateY(-4px)"></i> </label> </div> <div class="label"><i class="fas fa-globe-americas"></i></div> <div class="btn-group btn-group-toggle task-floating" id="task-floating-${taskId}" data-toggle="buttons" style="margin-right: 14px !important"> <label class="btn task-floating" id="task-floating-no-${taskId}"> <input type="radio" name="task-floating"> <i class="far fa-circle" style="transform:translateY(-4px)"></i> </label> <label class="btn task-floating" id="task-floating-yes-${taskId}"> <input type="radio" name="task-floating"> <i class="fas fa-circle" style="transform:translateY(-4px)"></i> </label> </div> <div class="label"><i class="far fa-play-circle"></i></div> <input class="task-defer textbox datebox" id="task-defer-${taskId}" type="text" autocomplete="off" style="margin-right: 10px"> <i class="fas fa-caret-right" style="color:${rightCarrotColor}; font-size:13px; transform: translateY(3px); margin-right: 5px"></i> <div class="label"><i class="far fa-stop-circle"></i></div> <input class="task-due textbox datebox" id="task-due-${taskId}" type="text" autocomplete="off" style="margin-right: 20px"> </div> <div class="task-tools"> <div class="label"><i class="fas fa-tasks"></i></div> <select class="task-project textbox editable-select" id="task-project-${taskId}" style="margin-right: 14px"> ${projectSelects} </select> <div class="label"><i class="fas fa-tags"></i></div>
<input class="task-tag textbox" id="task-tag-${taskId}" type="text" value="" onkeypress="this.style.width = ((this.value.length + 5) * 8) + 'px';" data-role="tagsinput" /> </div> </div> </div>`
    };

    return {Sortable:Sortable, sMatch: substringMatcher, sp: smartParse, spf: smartParseFull, daysBetween: numDaysBetween, taskHTML: calculateTaskHTML, gtc: getThemeColor}
}();

let ui = function() {

    // greeting of the day
    let greetings = ["Hello there,", "Hey,", "What's up,", "Howdy,", "Welcome,", "Yo!"];
    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // generic data containers used by refresh and others
    let pPandT, possibleProjects, possibleTags, possibleProjectsRev, possibleTagsRev;
    let possiblePerspectives;
    let inboxandDS;
    let avalibility;
    let projectDB;

    // current location
    let pageIndex = {
        currentView: "upcoming-page",
        projectDir: [],
        pageContentID: undefined
    };

    activeMenu = "today";

    // refresh data
    let refresh = async function(){
        pPandT = await getProjectsandTags(uid);
        possibleProjects = pPandT[0][0];
        possibleTags = pPandT[1][0];
        possibleProjectsRev = pPandT[0][1];
        possibleTagsRev = pPandT[1][1];
        possiblePerspectives = await getPerspectives(uid);
        avalibility = await getItemAvailability(uid);
        inboxandDS = await getInboxandDS(uid, avalibility);
        projectDB = await (async function() {
            let pdb = [];
            let topLevels = (await getTopLevelProjects(uid))[0];
            for (key in topLevels) {
                pdb.push(await getProjectStructure(uid, key, recursive=true));
            }
            return pdb;
        }());
    };

    // the outside world's refresh function
    let reloadPage = async function() {
        setTimeout(async function() {
            if (!activeTask) {
                (loadView(pageIndex.currentView, pageIndex.pageContentID));
                await constructSidebar();
                await $("#"+activeMenu).addClass("menuitem-selected");
            }
        }, 500);
    };


    const showPerspectiveEdit = function() {
        $("#perspective-back").on("click", function(e) {
            $("#perspective-unit").fadeOut(200);
            $("#overlay").fadeOut(200, () => reloadPage());
            $("#"+activeMenu).addClass("menuitem-selected");
        });

        $(document).on("click", "#overlay", function(e) {
            if (e.target === this) {
                $(".repeat-subunit").slideUp();
                $("#repeat-toggle-group").slideDown();
                $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
                $("#repeat-unit").fadeOut(200);
                $("#overlay").fadeOut(200, () => reloadPage());
                $("#"+activeMenu).addClass("menuitem-selected");
                $("#repeat-daterow").children().each(function(e) {
                    $(this).css({"background-color": interfaceUtil.gtc("--background-feature")});
                });
                $("#repeat-monthgrid").children().each(function(e) {
                    $(this).css({"background-color": interfaceUtil.gtc("--background")});
                });
            }
        });

        let currentP;

        $("#pquery").change(function(e) {
            modifyPerspective(uid, currentP, {query: $(this).val()});
        });

        $("#perspective-edit-name").change(function(e) {
            modifyPerspective(uid, currentP, {name: $(this).val()});
        });

        const edit = function(pspID) {
            $("#repeat-unit").hide();
            currentP = pspID;
            $("#overlay").fadeIn(200).css("display", "flex").hide().fadeIn(200);
            $("#perspective-unit").fadeIn(200);
            $("#perspective-edit-name").val(possiblePerspectives[0][pspID].name);
            $("#pquery").val(possiblePerspectives[0][pspID].query);
            // fix weird focus-select bug
            setTimeout(function() {$("#pquery").focus()}, 100);
        };

        return edit;
    }();

    // repeat view
    const showRepeat = function() {

        let tid;
        let repeatWeekDays = [];
        let repeatMonthDays = [];

        // Setup repeat things!
        $("#repeat-back").on("click", function(e) {
            $(".repeat-subunit").slideUp();
            $("#repeat-daterow").children().each(function(e) {
                $(this).css({"background-color": interfaceUtil.gtc("--background-feature")});
            });
            $("#repeat-monthgrid").children().each(function(e) {
                $(this).css({"background-color": interfaceUtil.gtc("--background")});
            });
            $("#repeat-toggle-group").slideDown();
            $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
            $("#repeat-unit").fadeOut(200);
            $("#overlay").fadeOut(200);
            $("#"+activeMenu).addClass("menuitem-selected");
            let repeatWeekDays = [];
            let repeatMonthDays = [];
        });


        $(document).on("click", "#overlay", function(e) {
            if (e.target === this) {
                $(".repeat-subunit").slideUp();
                $("#repeat-toggle-group").slideDown();
                $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
                $("#repeat-unit").fadeOut(200);
                $("#overlay").fadeOut(200, () => reloadPage());
                $("#"+activeMenu).addClass("menuitem-selected");
                $("#repeat-daterow").children().each(function(e) {
                    $(this).css({"background-color": interfaceUtil.gtc("--background-feature")});
                });
                $("#repeat-monthgrid").children().each(function(e) {
                    $(this).css({"background-color": interfaceUtil.gtc("--background")});
                });
                let repeatWeekDays = [];
                let repeatMonthDays = [];
            }
        });

        $("#repeat-type").on("click", function(e) {
            $(".repeat-subunit").slideUp();
            $("#repeat-toggle-group").slideDown();
            $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
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

        
        $(".repeat-monthgrid-day").on("click", function(e) {
            if (repeatMonthDays.includes($(this).html())) {
                $(this).animate({"background-color": interfaceUtil.gtc("--background")}, 100);
                repeatMonthDays = repeatMonthDays.filter(i => i !== $(this).html());
                modifyTask(uid, tid, {repeat: {rule: "monthly", on: repeatMonthDays}});
            } else {
                $(this).animate({"background-color": interfaceUtil.gtc("--background-feature")}, 100);
                repeatMonthDays.push($(this).html());
                modifyTask(uid, tid, {repeat: {rule: "monthly", on: repeatMonthDays}});
            }
        });

        let cr = async function(taskId) {
            $(".repeat-subunit").hide();
            $("#repeat-toggle-group").show();
            $("#repeat-type").fadeOut(() => $("#repeat-type").html(""));
            $("#perspective-unit").hide();
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
                        if (ti.repeat.on.includes($(this).html())) {
                            $(this).animate({"background-color": interfaceUtil.gtc("--decorative-light")});
                        }
                    });
                    repeatWeekDays = ti.repeat.on;
                    $("#repeat-weekly-unit").show();
                    $("#repeat-toggle-group").hide();
                    $("#repeat-type").html("every week.");
                    $("#repeat-type").show();
                } else if (ti.repeat.rule === "monthly") {
                    $("#repeat-monthgrid").children().each(function(e) {
                        if (ti.repeat.on.includes($(this).html())) {
                            $(this).animate({"background-color": interfaceUtil.gtc("--background-feature")});
                        }
                    });
                    repeatMonthDays = ti.repeat.on;
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
        };
        return cr;
    }();

        // the public refresh function

    let activeTask = null; // TODO: shouldn't this be undefined?
    let activeTaskDeInboxed = false;
    let activeTaskDeDsed = false;
    let activeTaskInboxed = false;


    // task methods!
    let taskManager = function() {
        //displayTask("inbox", task)

        let hideActiveTask = async function() {
            $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0"});
            $("#task-edit-"+activeTask).slideUp(300);
            $("#task-trash-"+activeTask).css("display", "none");
            $("#task-repeat-"+activeTask).css("display", "none");
            $("#task-"+activeTask).animate({"background-color": interfaceUtil.gtc("--background"), "padding": "0", "margin":"0"}, 100);
            $("#task-"+activeTask).css({"border-bottom": "0", "border-right": "0", "box-shadow": "0 0 0"});
            await refresh();
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
                    if (activeMenu==="today" && $($('#task-' + hTask).parent()).attr('id') !== "inbox") {
                        $('#task-'+hTask).slideUp(200);
                    }
                }
            }

            if (activeTaskInboxed) {
                let hTask = activeTask;
                iC = inboxandDS[0].length;
                dsC = inboxandDS[1].length;
                $("#unsorted-badge").html('' + iC);
                $("#duesoon-badge").html('' + dsC);
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
            sorters.project.option("disabled", false);
            sorters.inbox.option("disabled", false);
            await reloadPage();
        };


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
            // -------------------------------------------------------------------------------
            // Part 1: data parsing!
            // The Project
            let project = possibleProjects[projectID];
            
            // Project select options
            let projectSelects = " ";
            let buildSelectString = function(p, level) {
                if (!level) {
                    level = ""
                }
                pss = "<option>" + level + possibleProjects[p.id] + "</option>";
                if (p.children) {
                    for (let e of p.children) {
                        if (e.type === "project") {
                            pss = pss + buildSelectString(e.content, level+"&nbsp;&nbsp;");
                        }
                    }
                }
                return pss;
            };
            for (let proj of projectDB) {
                projectSelects = projectSelects + buildSelectString(proj);
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
            // -------------------------------------------------------------------------------
            // Part 2: the task!
            $("#" + pageId).append(interfaceUtil.taskHTML(taskId, name, desc, projectSelects, rightCarrotColor));
            // -------------------------------------------------------------------------------
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
            $("#task-defer-" + taskId).change(function(e) {
                e.preventDefault();
            });
            let dfstr = "";
            $("#task-defer-" + taskId).keydown(function(e) {
                //e.preventDefault();
                // TODO: this is a janky manual re-implimentation 
                // of a textbox to override jQuery's manual 
                // re-implimentation. The todo is to make it less
                // janky.
                if (e.keyCode >= 37 && e.keyCode <= 40) {
                    // handle arrows
                } else if (e.keyCode == 13) {
                    e.preventDefault();
                    if (dfstr === "") {
                        $("#task-defer-" + taskId).val("");
                        removeParamFromTask(uid, taskId, "defer");
                        defer = undefined;
                        defer_current = undefined;
                    } else {
                        let parsed = interfaceUtil.spf(dfstr);
                        if (parsed) {
                            defer_set = parsed.start.date();
                            $("#task-defer-" + taskId).datetimepicker("setDate", defer_set);
                            let tz = moment.tz.guess();
                            if (new Date() < defer_set) {
                                $('#task-name-' + taskId).css("opacity", "0.3");
                            } else {
                                $('#task-name-' + taskId).css("opacity", "1");
                            }
                            modifyTask(uid, taskId, {defer:defer_set, timezone:tz});
                            defer = defer_set;
                        }
                    }
                } else if (e.keyCode == 8) {
                    if (document.getSelection().toString() === this.value) {
                        dfstr = "";
                    } else {
                        dfstr = dfstr.substring(0, dfstr.length-1);
                    }
                } else if (e.key.length == 1) {
                    // handle actual key
                    if (document.getSelection().toString() === this.value) {
                        e.preventDefault();
                        $(this).val(e.key);
                    } else if (!e.metaKey) {
                        e.preventDefault();
                        $(this).val(this.value+e.key);
                        dfstr = this.value;
                    }
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
                    } else if (interfaceUtil.daysBetween(new Date(), due_set) <= 1) {
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
            $("#task-due-" + taskId).change(function(e) {
                e.preventDefault();
            });
            let duestr = "";
            $("#task-due-" + taskId).keydown(function(e) {
                //e.preventDefault();
                // TODO: this is a janky manual re-implimentation 
                // of a textbox to override jQuery's manual 
                // re-implimentation. The todo is to make it less
                // janky.
                if (e.keyCode >= 37 && e.keyCode <= 40) {
                    // handle arrows
                } else if (e.keyCode == 13) {
                    e.preventDefault();
                    if (duestr === "") {
                        if ($('#task-pseudocheck-' + taskId).hasClass("ds") || $('#task-pseudocheck-' + taskId).hasClass("od")) {
                            activeTaskDeDsed = true;
                        }
                        $("#task-due-" + taskId).val("");
                        removeParamFromTask(uid, taskId, "due");
                        $('#task-pseudocheck-' + taskId).removeClass("od");
                        $('#task-pseudocheck-' + taskId).removeClass("ds");
                        due = undefined;
                        due_current = undefined;
                    } else {
                        let parsed = interfaceUtil.spf(duestr);
                        if (parsed) {
                            due_set = parsed.start.date();
                            $("#task-due-" + taskId).datetimepicker("setDate", due_set);
                            let tz = moment.tz.guess();
                            if (new Date() > due_set) {
                                $('#task-pseudocheck-' + taskId).addClass("od");
                                $('#task-pseudocheck-' + taskId).removeClass("ds");
                            } else if (interfaceUtil.daysBetween(new Date(), due_set) <= 1) {
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
                    }
                } else if (e.keyCode == 8) {
                    if (document.getSelection().toString() === this.value) {
                        duestr = "";

                    } else {
                        duestr = duestr.substring(0, duestr.length-1);
                    }
                } else if (e.key.length == 1) {
                    // handle actual key
                    if (document.getSelection().toString() === this.value) {
                        e.preventDefault();
                        $(this).val(e.key);
                    } else if (!e.metaKey) {
                        e.preventDefault();
                        $(this).val(this.value+e.key);
                        duestr = this.value;
                    }
                }
            });
            // So apparently setting dates is hard for this guy, so we run this async
            let setDates = async () => {
                if (defer_current) {
                    $("#task-defer-" + taskId).datetimepicker('setDate', (defer_current));
                }
                if (due_current) {
                    $("#task-due-" + taskId).datetimepicker('setDate', (due_current));
                }
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
            }).on('select.editable-select', async function (e, li) {
                let projectSelected = li.text().trim();
                let projId = possibleProjectsRev[projectSelected];
                if (project === undefined) {
                    activeTaskDeInboxed = true;
                } else {
                    await dissociateTask(uid, taskId, projectID);
                }
                modifyTask(uid, taskId, {project:projId});
                projectID = projId;
                project = projectSelected;
                $('#task-project-' + taskId).val(project);
                await associateTask(uid, taskId, projId);
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
            // -------------------------------------------------------------------------------
            // Part 4: task action behaviors!
            // Task complete
            $('#task-check-'+taskId).change(function(e) {
                if (this.checked) {
                    taskManager.hideActiveTask();
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
                        //console.error(err);
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
                                let oDow = due.getDate();
                                let defDistance = due-defer;
                                while ((!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getDate() === new Date(due.getFullYear(), due.getMonth()+1, 0).getDate()))) || (oDow === dow)) {
                                    due.setDate(due.getDate() + 1);
                                    dow = due.getDate();
                                }
                            } else {
                                let rOn = repeat.on;
                                let dow = due.getDate();
                                let oDow = due.getDate();
                                while ((!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getDate() === new Date(due.getFullYear(), due.getMonth()+1, 0).getDate()))) || (oDow === dow)) {
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
             $('#task-project-' + taskId).change(async function(e) {
                if (this.value in possibleProjectsRev) {
                    let projId = possibleProjectsRev[this.value];
                    if (project === undefined){
                        activeTaskDeInboxed = true;
                    } else {
                        await dissociateTask(uid, taskId, projectID);
                    }
                    modifyTask(uid, taskId, {project:projId});
                    await associateTask(uid, taskId, projId);
                    projectID = projId;
                    project = this.value;
                } else {
                    modifyTask(uid, taskId, {project:""});
                    this.value = ""
                    if (project !== undefined) {
                        activeTaskInboxed = true;
                        await dissociateTask(uid, taskId, projectID);
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

            // Remove flagged parameter
            $("#task-flagged-no-" + taskId).change(function(e) {
                isFlagged = false;
                modifyTask(uid, taskId, {isFlagged: false});
               // TODO: Unflagged Style? So far flagged is
               // just another filter for perspective selection
            });

            // Add flagged parameter
            $("#task-flagged-yes-" + taskId).change(function(e) {
                isFlagged = true;
                modifyTask(uid, taskId, {isFlagged: true});
               // TODO: Flagged Style?
            });

            // Remove floating parameter and calculate dates
            $("#task-floating-no-" + taskId).change(function(e) {
                isFloating = false;
                modifyTask(uid, taskId, {isFloating: false});
                defer_current = defer;
                due_current = due;
                setDates();
            });

            // Add floating parameter and calculate dates
            $("#task-floating-yes-" + taskId).change(function(e) {
                isFloating = true;
                modifyTask(uid, taskId, {isFloating: true});
                defer_current = moment(defer).tz(timezone).local(true).toDate();
                due_current = moment(due).tz(timezone).local(true).toDate();
                setDates();
            });

        };

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

                getProjectStructure(uid, pageIndex.pageContentID).then(async function(nstruct) {
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
                    reloadPage();
                });
            }
        });


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
                let oi = e.oldIndex;
                let ni = e.newIndex;
                getPerspectives(uid).then(function(topLevelItems) {
                    let originalIBT = topLevelItems[2].map(i => i.id);
                    if (oi<ni) {
                        // Handle task moved down
                        for(let i=oi+1; i<=ni; i++) {
                            modifyPerspective(uid, originalIBT[i], {order: i-1});
                        }
                        modifyPerspective(uid, originalIBT[oi], {order: ni});
                    } else if (oi>ni) {
                        // Handle task moved up
                        for(let i=oi-1; i>=ni; i--) {
                            modifyPerspective(uid, originalIBT[i], {order: i+1});
                        }
                        modifyPerspective(uid, originalIBT[oi], {order: ni});
                    }
                });
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

        return {inbox: inboxSort, project: projectSort, menuProject: topLevelProjectSort, menuPerspective: perspectiveSort};
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
                inboxandDS[1].map(task => taskManager.generateTaskInterface("due-soon", task))
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

        // perspective view loader
        let perspective = async function(pid) {
            pageIndex.pageContentID = pid;
            // get name
            let perspectiveObject = possiblePerspectives[0][pid];
            // set value
            $("#perspective-title").val(perspectiveObject.name);
            // calculate perspective
            perspectiveHandler.calc(uid, perspectiveObject.query).then(async function(tids) {
                for (let taskId of tids) {
                    // Nononono don't even think about foreach 
                    // othewise the order will be messed up
                    await taskManager.generateTaskInterface("perspective-content", taskId);
                }
            });
        }

        // project view loader
        let project = async function(pid) {
            // update pid
            pageIndex.pageContentID = pid;
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
        };

        return {upcoming: upcoming, project: project, perspective: perspective};
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
            if ($(this).attr("id") != viewName) {
                $(this).css("display", "none");
            }
        });

        // clear all contentboxes
        $("#inbox").empty();
        $("#due-soon").empty();
        $("#project-content").empty();
        $("#perspective-content").empty();

        // refresh data
        await refresh();
        // load the dang view
        switch(viewName) {
            case 'upcoming-page':
                viewLoader.upcoming();
                break;
            case 'perspective-page':
                viewLoader.perspective(itemID);
                break;
            case 'project-page':
                viewLoader.project(itemID);
                break;
        }

        // bring it!
        $("#"+viewName).show();

        // tell everyone to bring it!
        pageIndex.currentView = viewName;

    };

    // document action listeners!!
    $(document).on('click', '.menuitem', function(e) {
        $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
        activeMenu = $(this).attr('id');
        if (activeMenu.includes("perspective")) {
            loadView("perspective-page", activeMenu.split("-")[1]);
            $("#"+activeMenu).addClass("menuitem-selected");
        } else if (activeMenu.includes("perspective")) {
            $("#"+activeMenu).addClass("menuitem-selected");
            loadView("perspective-page", activeMenu.split("-")[1]);
        } else if (activeMenu.includes("project")) {
            if (!$(this).hasClass("subproject")) {
                pageIndex.projectDir = [];
            }
            $("#"+activeMenu).addClass("menuitem-selected");
            pageIndex.projectDir.push(activeMenu);
            loadView("project-page", activeMenu.split("-")[1]);
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
            sorters.project.option("disabled", true);
            sorters.inbox.option("disabled", true);
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
        pageIndex.projectDir.pop();
        activeMenu = pageIndex.projectDir[pageIndex.projectDir.length-1];
        loadView("project-page", activeMenu.split("-")[1]);
        $("#"+activeMenu).addClass("menuitem-selected");
    });

    $(document).on("click", "#new-project", function() {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let projObj = {
            top_level: false,
            is_sequential: false,
        };
        newProject(uid, projObj, pid).then(function(npID) {
            associateProject(uid, npID, pid);
            $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
            activeMenu = "project-"+npID;
            pageIndex.projectDir.push(activeMenu);
            loadView("project-page", npID).then(() => setTimeout(function() {$("#project-title").focus(); $("#project-title").select()}, 100));
            $("#"+activeMenu).addClass("menuitem-selected");
        });
    });

    $(document).on("click", "#perspective-add", function() {
        let perspectiveObj = {
            name: "",
            query: "",
        };
        newPerspective(uid, perspectiveObj).then(function(npID) {
            $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
            activeMenu = "perspective-"+npID;
            $(".perspectives").append(`<div id="perspective-${npID}" class="menuitem perspective mihov"><i class="fa fa-layer-group"></i><t style="padding-left:8px"></t></div>`)
            loadView("perspective-page", npID).then(async function(){
                // Delay because of HTML bug
                await refresh();
                showPerspectiveEdit(npID);
                setTimeout(function() {
                    $("#perspective-edit-name").focus();
                    $("#perspective-edit-name").select();
                }, 500);
            });
            $("#"+activeMenu).addClass("menuitem-selected");
        });
    });

    $(document).on("click", "#project-add-toplevel", function() {
        let projObj = {
            name: "New Project",
            top_level: true,
            is_sequential: false,
        };
        newProject(uid, projObj).then(function(npID) {
            $("#"+activeMenu).removeClass('today-highlighted menuitem-selected');
            activeMenu = "project-"+npID;
            pageIndex.projectDir = [activeMenu];
            $(".projects").append(`<div id="project-${npID}" class="menuitem project mihov"><i class="fas fa-project-diagram"></i><t style="padding-left:8px; text-overflow: ellipsis; overflow: hidden">New Project</t></div>`);
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

    $(document).on("click", "#perspective-trash", function() {
        let pid = pageIndex.pageContentID;
        $("#"+activeMenu).removeClass("menuitem-selected");
        loadView("upcoming-page");
        activeMenu = "today";
        $("#today").addClass("menuitem-selected");
        $("#perspective-"+pid).remove();
        deletePerspective(uid, pid);
    });

    $(document).on("click", "#project-trash", function() {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let isTopLevel = pageIndex.projectDir.length === 1 ? true : false;
        deleteProject(uid, pid).then(function() {
            pageIndex.projectDir.pop();
            if (pageIndex.projectDir.length > 0) {
                dissociateProject(uid, pid, (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1]).then(function() {
                activeMenu = pageIndex.projectDir[pageIndex.projectDir.length-1];
                loadView("project-page", pageIndex.projectDir[pageIndex.projectDir.length-1].split("-")[1]);
                });
            } else {
                activeMenu = "today";
                $("#today").addClass("menuitem-selected");
                loadView("upcoming-page");
                $("#project-"+pid).remove();
            }

        });
    });

    $(document).on("click", "#new-task", function() {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let ntObject = {
            desc: "",
            isFlagged: false,
            isFloating: false,
            isComplete: false,
            project: pid,
            tags: [],
            timezone: moment.tz.guess(),
            repeat: {rule: "none"},
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
                sorters.project.option("disabled", true);
                sorters.inbox.option("disabled", true);
            });
        });
    });

    $(document).on("change", "#project-title", function(e) {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        let value = $(this).val();
        modifyProject(uid, pid, {name: value});
        reloadPage();
        //console.error(e);
    });

    $(document).on("change", "#perspective-title", function(e) {
        let pstID = pageIndex.pageContentID;
        let value = $(this).val();
        modifyPerspective(uid, pstID, {name: value});
        reloadPage();
        //console.error(e);
    });

    $(document).on("click", "#project-sequential-yes", function(e) {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        modifyProject(uid, pid, {is_sequential: true}).then(function() {
            reloadPage();
        });
        //console.error(e);
    });

    $(document).on("click", "#project-sequential-no", function(e) {
        let pid = (pageIndex.projectDir[pageIndex.projectDir.length-1]).split("-")[1];
        modifyProject(uid, pid, {is_sequential: false}).then(function() {
            reloadPage();
        });
        //console.error(e);
    });

    $(document).on("click", "#logout", function(e) {
        firebase.auth().signOut().then(() => {}, console.error);
        //console.error(e);
    });

    $(document).on("click", "#perspective-edit", function(e) {
        showPerspectiveEdit(pageIndex.pageContentID);
        //console.error(e);
    });

    $("#quickadd").click(function(e) {
        $(this).animate({"width": "350px"}, 500);
        //console.error(e);
    });

    $("#quickadd").blur(function(e) {
        $(this).val("");
        $(this).animate({"width": "250px"}, 500);
        //console.error(e);
    });


    $("#quickadd").keydown(function(e) {
        // TODO: make the user unable to spam
        if (e.keyCode == 13) {
            let tb = $(this);
            tb.animate({"background-color": interfaceUtil.gtc("--quickadd-success"), "color": interfaceUtil.gtc("--quickadd-success-text")}, 100, function() {
                let newTaskUserRequest = chrono.parse($(this).val());
                // TODO: so this dosen't actively watch for the word "DUE", which is a problem.
                // Make that happen is the todo.
                let startDate;
                //let endDate;
                let tz = moment.tz.guess();
                let ntObject = {
                    desc: "",
                    isFlagged: false,
                    isFloating: false,
                    isComplete: false,
                    project: "",
                    tags: [],
                    timezone: tz,
                    repeat: {rule: "none"},
                };
                if (newTaskUserRequest.length != 0) {
                    let start = newTaskUserRequest[0].start;
                    //let end = newTaskUserRequest[0].end;
                    if (start) {
                        startDate = start.date();
                        ntObject.due = startDate;
                        ntObject.name = tb.val().replace(newTaskUserRequest[0].text, '')
                    }
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
                    tb.animate({"background-color": interfaceUtil.gtc("--quickadd"), "color": interfaceUtil.gtc("--quickadd-text")}, function() {
                        tb.blur();
                        tb.val("");
                    });
                });
            });
            
        } else if (e.keyCode == 27) {
            $(this).blur();
        }
    });

    let user;
    let uid;
    let displayName;
    // TODO: actually set theme
    //let currentTheme = "condutiontheme-default";

    let constructSidebar = async function() {
        let tlps = (await getTopLevelProjects(uid));
        let pPandT = (await getProjectsandTags(uid));
        $(".projects").empty();
        $(".perspectives").empty();
        for (let proj of tlps[2]) {
            $(".projects").append(`<div id="project-${proj.id}" class="menuitem project mihov"><i class="fas fa-project-diagram"></i><t style="padding-left:8px; text-overflow: ellipsis; overflow: hidden">${proj.name}</t></div>`);
        }
        let psps = (await getPerspectives(uid));
        for (let psp of psps[2]) {
            $(".perspectives").append(`<div id="perspective-${psp.id}" class="menuitem perspective mihov"><i class="fa fa-layer-group"></i><t style="padding-left:8px">${psp.name}</t></div>`)
        }
    };

    let setUser = function(usr) {
        user = usr;
        uid = usr.uid;
        displayName = usr.displayName;
        user = usr;
    };

    return {user:{set: setUser, get: () => user}, load: loadView, update: reloadPage, constructSidebar: constructSidebar};
}();

$(document).ready(async function() {
    firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            if (user.emailVerified) {
                const startTime = Date.now();
                // User is signed in. Do user related things.
                // Check user's theme
                ui.user.set(user);
                await ui.constructSidebar();
                await ui.load("upcoming-page");
                $("#loading").fadeOut();
                /*currentTheme = "condutiontheme-default-dark";*/
                //$("body").removeClass();
                /*$("body").addClass(currentTheme);*/
                $("#content-wrapper").fadeIn();
                setInterval(() => ui.update(), 15 * 60 * 1000);
            } else {
                window.location.replace("auth.html");
            }
        } else {
            firebase.auth().signOut();
            window.location.replace("auth.html");
        }
    });
});

