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


    let getThemeColor = (colorName) => $("."+currentTheme).css(colorName);

    let calculateTaskHTML = function(taskId, name, desc, projectSelects, rightCarrotColor) {
        return `<div id="task-${taskId}" class="task"> <div id="task-display-${taskId}" class="task-display" style="display:block"> <input type="checkbox" id="task-check-${taskId}" class="task-check"/> <label class="task-pseudocheck" id="task-pseudocheck-${taskId}" for="task-check-${taskId}" style="font-family: 'Inter', sans-serif;">&zwnj;</label> <input class="task-name" id="task-name-${taskId}" type="text" autocomplete="off" value="${name}"> <div class="task-trash task-subicon" id="task-trash-${taskId}" style="float: right; display: none;"><i class="fas fa-trash"></i></div> <div class="task-repeat task-subicon" id="task-repeat-${taskId}" style="float: right; display: none;"><i class="fas fa-redo-alt"></i></div> </div> <div id="task-edit-${taskId}" class="task-edit" style="display:none"> <textarea class="task-desc" id="task-desc-${taskId}" type="text" autocomplete="off" placeholder="Description">${desc}</textarea> <div class="task-tools" style="margin-bottom: 9px;"> <div class="label"><i class="fas fa-flag"></i></div> <div class="btn-group btn-group-toggle task-flagged" id="task-flagged-${taskId}" data-toggle="buttons" style="margin-right: 20px"> <label class="btn task-flagged"> <input type="radio" name="task-flagged" class="task-flagged-no" id="task-flagged-no-${taskId}"> <i class="far fa-circle" style="transform:translateY(-4px)"></i> </label> <label class="btn task-flagged"> <input type="radio" name="task-flagged" class="task-flagged-yes" id="task-flagged-yes-${taskId}"> <i class="fas fa-circle" style="transform:translateY(-4px)"></i> </label> </div> <div class="label"><i class="fas fa-globe-americas"></i></div> <div class="btn-group btn-group-toggle task-floating" id="task-floating-${taskId}" data-toggle="buttons" style="margin-right: 14px"> <label class="btn task-floating"> <input type="radio" name="task-floating" id="task-floating-no-${taskId}"> <i class="far fa-circle" style="transform:translateY(-4px)"></i> </label> <label class="btn task-floating"> <input type="radio" name="task-floating" id="task-floating-yes-${taskId}"> <i class="fas fa-circle" style="transform:translateY(-4px)"></i> </label> </div> <div class="label"><i class="far fa-play-circle"></i></div> <input class="task-defer textbox datebox" id="task-defer-${taskId}" type="text" autocomplete="off" style="margin-right: 10px"> <i class="fas fa-caret-right" style="color:${rightCarrotColor}; font-size:13px; transform: translateY(3px); margin-right: 5px"></i> <div class="label"><i class="far fa-stop-circle"></i></div> <input class="task-due textbox datebox" id="task-due-${taskId}" type="text" autocomplete="off" style="margin-right: 20px"> </div> <div class="task-tools"> <div class="label"><i class="fas fa-tasks"></i></div> <select class="task-project textbox editable-select" id="task-project-${taskId}" style="margin-right: 14px"> ${projectSelects} </select> <div class="label"><i class="fas fa-tags"></i></div>
<input class="task-tag textbox" id="task-tag-${taskId}" type="text" value="" onkeypress="this.style.width = ((this.value.length + 5) * 8) + 'px';" data-role="tagsinput" /> </div> </div> </div>`
    }

    return {Sortable:Sortable, sMatch: substringMatcher, sp: smartParse, daysBetween: numDaysBetween, taskHTML: calculateTaskHTML}
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

    // the pubilc refresh function
    
    // task methods!
    let taskManager = async function() {
        //displayTask("inbox", task)

        //var isTaskActive = false;
        var activeTask = null; // TODO: shouldn't this be undefined?
        var activeTaskDeInboxed = false;
        var activeTaskDeDsed = false;
        var activeTaskInboxed = false;

        let displayTask = async function(pageId, taskId, sequentialOverride) {
            // Part 0: data gathering!
            // Get the task
            let taskObj = await getTaskInformation(uid, taskId);

            // Get info about the task
            let projectID = taskObj.project;
            let tagIDs = taskObj.tags;
            let isFlagged = taskObj.isFlagged;
            let isFloating = taskObj.isFloating;
            var name = taskObj.name;
            var desc = taskObj.desc;
            let timezone = taskObj.timezone;
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
            let rightCarrotColor = getThemeColor("--decorative-light");
            // ---------------------------------------------------------------------------------
            // Part 2: the task!
            $("#" + pageId).append(interfaceUtil.taskHTML(taskId, nam, desc, projectSelects, rightCarrotColor));
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
            
            
            // TODO!!!!!! Set floating and flagged appearance
            
        }

        return {generateTaskInterface: displayTask};
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
                // TODO: refresh page!!
            }
        });
        // project sorter
        var projectSort = new interfaceUtil.Sortable($("#project-content")[0], {
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
                // TODO: refresh page!!
            }
        });

        return {inbox: inboxSort, project: projectSort};
    }();
    
    // various sub-page loaders
    let viewLoader = function() {
        // this private function populates the view requested
        
        // upcoming view loader
        let upcoming = async function() {
            Promise.all(
                // load inbox tasks
                inboxandDS[0].map(task => displayTask("inbox", task)),
                // load due soon tasks
                inboxandDS[1].map(task => displayTask("due-soon", task)),
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
            if (projDir.length <= 1) {
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
                        await displayTask("project-content", taskId);
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
            if ($(this).attr("id") != pageId){
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
            case 'upcoming-page':
                await viewLoader.project(itemID);
                break;
        }
        
        // bring it!
        $("#"+pageId).show();

        // tell everyone to bring it!
        pageIndex.currentView = viewName;
    }

    return {load: loadView};
}();


