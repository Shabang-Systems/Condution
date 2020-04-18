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

    // refresh data 
    let __refresh = async function(){
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
                        // Handle task moved down
                        for(let i=oi+1; i<=ni; i++) {
                            // move each task down in order
                            modifyTask(uid, inboxandDS[0][i], {order: i-1});
                        }
                        // change the order of the moved task
                        modifyTask(uid, inboxandDS[0][oi], {order: ni});
                    } else if (oi>ni) {
                        // Handle task moved up
                        for(let i=oi-1; i>=ni; i--) {
                            // move each task up in order
                            modifyTask(uid, inboxandDS[0][i], {order: i+1});
                        }
                        // change the order of the moved task
                        modifyTask(uid, inboxandDS[0][oi], {order: ni});
                    }

                });
                // TODO: refresh page!!
/*                setTimeout(function() {*/
                    //if (!isTaskActive) showPage(currentPage)
                /*}, 100);*/
            }
        });
        return {inbox: inboxSort};
    }();
    
    // various sub-page loaders
    let __viewLoader = function() {
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
        return {upcoming: upcoming};
    }();

    let loadView = async function(viewName) {
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
        await __refresh();

        // load each view
    }

    return {load: loadView};
}();


