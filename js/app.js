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

    return {Sortable:Sortable, sMatch: substringMatcher, sp: smartParse, daysBetween: numDaysBetween}
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
    

    // sorters
    let sorters = function() {
        // inbox sorter
        let inboxSort = new interfaceUtil.Sortable($("#inbox")[0], {
            animation: 200,
            onEnd: function(e) {
                let oi = e.oldIndex;
                let ni = e.newIndex;
                __refresh().then(function() {
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


