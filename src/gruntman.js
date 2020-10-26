const { parseFromTimeZone } = require('date-fns-timezone')

/* AutoBind */
const autoBind = require('auto-bind/react');

class Gruntman {

    /*
     * Hello human,
     * good afternoon.
     * I am gruntman.
     *
     * Register refreshers with me
     * so I could handle refreshes.
     *
     * Do actions with me
     * so I could reverse them.
     *
     * Undo happens from me
     * refresh happens from me.
     *
     *
     * @jemoka
     *
     */

    constructor(engine) {
        this.e = engine;
        this.refresher = ()=>{};
        this.callbackRefresherReleased = true; // prevent live callback merge conflicts
        this.conflictResolution = 1000; // 1000 ms = 1s worth of conflict time.
        this.releaseTimeout = undefined;


        this.doers = {
            tag: {
                create: async function (options) {
                    let newTag = await engine.db.newTag(options.uid, options.name);
                    return {uid: options.uid, id: newTag};
                }
            },
            task: {
                create: async function (options) {
                    let ntObject = {
                        desc: "",
                        isFlagged: false,
                        isFloating: false,
                        isComplete: false,
                        project: options.pid?options.pid:"",
                        tags: [],
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        repeat: {rule: "none"},
                        name: "",
                    };
                    
                    if (options.due)
                        ntObject.due = options.due
                    if (options.defer)
                        ntObject.defer = options.defer

                    let ntID = await engine.db.newTask(options.uid, ntObject)

                    if (options.pid && options.pid != "")
                        engine.db.associateTask(options.uid, ntID, options.pid);

                    return {uid: options.uid, tid: ntID};
                },
                update: async function (options) {
                    let tInfo = await engine.db.getTaskInformation(options.uid, options.tid);
                    await engine.db.modifyTask(options.uid, options.tid, options.query)

                    return {uid: options.uid, tid: options.tid, tInfo};
                },
                update__project:  async function (options) {
                    let tInfo = await engine.db.getTaskInformation(options.uid, options.tid);
                    await engine.db.modifyTask(options.uid, options.tid, {project: options.project})

                    if (options.oldProject)
                        await engine.db.dissociateTask(options.uid, options.tid, options.oldProject);

                    if (options.project !== "")
                        await engine.db.associateTask(options.uid, options.tid, options.project);

                    return {uid: options.uid, tid: options.tid, tInfo};
                },
                update__uncomplete: async function (options) {
                    let taskInfo = await engine.db.getTaskInformation(options.uid, options.tid);
                    await engine.db.modifyTask(options.uid, options.tid, {isComplete: false, completeDate: new Date()});
                    return {uid: options.uid, tid: options.tid, taskInfo};
                },
		update__complete: async function (options) {
                    await engine.db.modifyTask(options.uid, options.tid, {isComplete: true, completeDate: new Date()})
                    let taskInfo = await engine.db.getTaskInformation(options.uid, options.tid);
                    let due = (
                        taskInfo.due ?
                            (taskInfo.isFloating ?
                                new Date(taskInfo.due.seconds*1000) :
                                parseFromTimeZone(
                                    (new Date(taskInfo.due.seconds*1000)).toISOString(),
                                    {timeZone: taskInfo.timezone}
                                )
                            ):
                        undefined
                    );
                    let defer = (
                        taskInfo.defer ?
                            (taskInfo.isFloating ?
                                new Date(taskInfo.defer.seconds*1000) :
                                    parseFromTimeZone(
                                        (new Date(taskInfo.defer.seconds*1000)).toISOString(),
                                       {timeZone: taskInfo.timezone}
                                    )
                            ): undefined
                    );
                    let repeat = taskInfo.repeat;
                    if (repeat.rule !== "none" && due) {
                        let rRule = repeat.rule;
                        if (rRule === "daily") {
                            if (defer) {
                                let defDistance = due-defer;
                                due.setDate(due.getDate() + 1);
                                engine.db.modifyTask(options.uid, options.tid, {isComplete: false, due:due, defer:(new Date(due-defDistance))});
                            } else {
                                due.setDate(due.getDate() + 1);
                                engine.db.modifyTask(options.uid, options.tid, {isComplete: false, due:due});
                            }

                        } else if (rRule === "weekly2") {
                            if (defer) {
                                let rOn = repeat.on;
                                let current = "";
                                let defDistance = due-defer;
                                if (rOn) {
                                    while (!rOn.includes(current)) {
                                        due.setDate(due.getDate() + 1);
                                        let dow = due.getDay();
                                        switch (dow) {
                                            case 1:
                                                current = "M";
                                                break;
                                            case 2:
                                                current = "T";
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
                                                current = "S";
                                                break;
                                            case 0:
                                                current = "Su";
                                                break;
                                        }
                                    }
                                } else {
                                    due.setDate(due.getDate()+7);
                                    defer.setDate(defer.getDate()+7);
                                }
                                engine.db.modifyTask(options.uid, options.tid, {isComplete: false, due:due, defer:(new Date(due-defDistance))});
                            } else {
                                let rOn = repeat.on;
                                if (rOn) {
                                    let current = "";
                                    while (!rOn.includes(current)) {
                                        due.setDate(due.getDate() + 1);
                                        let dow = due.getDay();
                                        switch (dow) {
                                            case 1:
                                                current = "M";
                                                break;
                                            case 2:
                                                current = "T";
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
                                                current = "S";
                                                break;
                                            case 0:
                                                current = "Su";
                                                break;
                                        }
                                    }
                                } else {
                                    due.setDate(due.getDate()+7);
                                }
                                engine.db.modifyTask(options.uid, options.tid, {isComplete: false, due:due});
                            }
                        } else if (rRule === "monthly") {
                            if (defer) {
                                let rOn = repeat.on;
                                let dow = due.getDate();
                                let oDow = due.getDate();
                                let defDistance = due-defer;
                                if (rOn) {
                                    while ((!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getDate() === new Date(due.getFullYear(), due.getMonth()+1, 0).getDate()))) || (oDow === dow)) {
                                        due.setDate(due.getDate() + 1);
                                        dow = due.getDate();
                                    }
                                } else {
                                    due.setMonth(due.getMonth()+1);
                                }
                                engine.db.modifyTask(options.uid, options.tid, {isComplete: false, due:due, defer:(new Date(due-defDistance))});
                            } else {
                                let rOn = repeat.on;
                                if (rOn) {
                                    let dow = due.getDate();
                                    let oDow = due.getDate();
                                    while ((!rOn.includes(dow.toString()) && !(rOn.includes("Last") && (new Date(due.getFullYear(), due.getMonth(), due.getDate()).getDate() === new Date(due.getFullYear(), due.getMonth()+1, 0).getDate()))) || (oDow === dow)) {
                                        due.setDate(due.getDate() + 1);
                                        dow = due.getDate();
                                    }
                                } else {
                                    due.setMonth(due.getMonth()+1);
                                }
                                engine.db.modifyTask(options.uid, options.tid, {isComplete: false, due:due});
                            }
                        } else if (rRule === "yearly") {
                            if (defer) {
                                let defDistance = due-defer;
                                due.setFullYear(due.getFullYear() + 1);
                                engine.db.modifyTask(options.uid, options.tid, {isComplete: false, due:due, defer:(new Date(due-defDistance))});
                            } else {
                                due.setFullYear(due.getFullYear() + 1);
                                engine.db.modifyTask(options.uid, options.tid, {isComplete: false, due:due});
                            }

                        }
                    }
                    return {message: "Todo TODO TODO Todo: undo pack?"}
                }
            },
            project: {
                update__name: async function (options) { // update the perspective name!
                    let possibleProjects = await engine.db.getProjectsandTags(options.uid);
                    // get all possible perspectives
                    let projectName = possibleProjects[0][0][options.id]
                    // get the one we want based on page id

                    // modify the perspective
                    await engine.db.modifyProject(options.uid, options.id, {name: options.name});
                    // return what we need to undo
                    return {projectName, uid: options.uid}
                },
                update__pstate: async function (options) { // update the perspective name!
                    let currentProject = await engine.db.getProjectStructure(options.uid, options.id, false); // get current project info
                    // get all possible perspectives
                    let is_sequential = currentProject;
                    // get the one we want based on page id

                    // modify the perspective
                    await engine.db.modifyProject(options.uid, options.id, {is_sequential: options.is_sequential});
                    // return what we need to undo
                    return {is_sequential, uid: options.uid}
                },
                associate:  async function (options) {
                    //await engine.db.modifyTask(options.uid, options.tid, options.query)
                    await engine.db.associateTask(options.uid, options.tid, options.pid);
                    return {uid: options.uid, tid: options.tid};
                },
                dissociate:  async function (options) {
                    //await engine.db.modifyTask(options.uid, options.tid, options.query)
                    await engine.db.dissociateTask(options.uid, options.tid, options.pid);
                    return {uid: options.uid, tid: options.tid};
                }
            },
	    perspective: {
		update__name: async function (options) { // update the perspective name!
		    let possiblePerspectives = await engine.db.getPerspectives(options.uid);
		    // get all possible perspectives
		    let perspectiveObject = possiblePerspectives[0][options.id]
		    // get the one we want based on page id

		    // modify the perspective
		    await engine.db.modifyPerspective(options.uid, options.id, {name: options.name});

		    // return what we need to undo
		    return {perspectiveObject, uid: options.uid}
		}
	    },
        } // type:action:functionaction (return resources)
        this.undoers = {
            task: {
                update: "task.set"
            }
        } // action: string
        this.backlog = []; // actionID
        this.undolog = []; // actionID
        this.taskLog = {
        } // actionID: [type, resources]
        this.canUndo = {
            task: {
                update: true,
            }
        }
        this.schedulers = {
        } // util function onChange fixer-upper
        this.updateLock = false;
        this.updateInterval = undefined;
         
        // And AutoBind any and all functions
        autoBind(this);
    }

    lockUpdates() {
        this.updateLock = true;
        if (this.updateInterval)
            clearTimeout(this.updateInterval);
        this.updateInterval = undefined;
    }

    unlockUpdates(interval=580) {
        this.updateLock = false;
        this.updateInterval = setTimeout(this.refresher, interval);
    }

    requestRefresh() {
        if (!this.updateLock && this.callbackRefresherReleased)
            this.refresher();
    }

    /*
     * @param refresher: refresher function to refresh what you registered
     */

    registerRefresher(r) { 
        this.refresher = r;
        // lock updates every time a new page loads to prevent MeRGE Conflicts
        if(this.releaseTimeout) clearTimeout(this.releaseTimeout);
        this.callbackRefresherReleased= false;
        this.releaseTimeout = setTimeout(()=>{this.callbackRefresherReleased=true; this.releaseTimeout=undefined}, this.conflictResolution); 
    }

    registerScheduler(callback, identifier, wait=500) {
        if (this.schedulers[identifier])
            clearTimeout(this.schedulers[identifier]); // clear the timeout
        this.schedulers[identifier] = setTimeout(callback, wait);
    }

    async do(actionName, options, bypassUpdates, isUndo, unsafe_FORCE_UPDATES) {
        /*
         * @param actionName => action directive like task.edit or project.create
         * @param options => options
         *
         */

        // Lock updates every time cacheRef is called to prevent mErGE ConFLIcTS 
        if(this.releaseTimeout) clearTimeout(this.releaseTimeout);
        this.callbackRefresherReleased= false;
        this.releaseTimeout = setTimeout(()=>{this.callbackRefresherReleased=true; this.releaseTimeout=undefined}, this.conflictResolution); 

        let actionID = this.random();

        let nodes = actionName.split(".");

        let action = this.doers;
        while (nodes.length > 0) {
            action = action[nodes.shift()];
        }

        if (isUndo) this.undolog.push(actionID);
        else this.backlog.push(actionID);
    
        let resources = await action(options);

        this.taskLog[actionID] = [actionName, resources];

        if (!this.updateLock && !bypassUpdates)
            this.refresher();

        if (unsafe_FORCE_UPDATES)
            this.refresher();

        return await resources;
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}
}

export default Gruntman;

