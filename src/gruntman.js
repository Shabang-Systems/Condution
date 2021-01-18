import { Plugins } from '@capacitor/core';
import { getPlatforms } from '@ionic/react';

const { parseFromTimeZone } = require('date-fns-timezone')

const { LocalNotifications, Permissions } = Plugins;

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
        this.notifPermissionGranted = false;
        this.notifList = {notifications:[]};
        Permissions.query({name: "notifications"}).then((async function (e) {
            if (e.state === "prompt")
                this.notifPermissionGranted = (await LocalNotifications.requestPermission()).granted;
            else if (e.state === "granted")
                this.notifPermissionGranted = true;

            let platforms = getPlatforms();
            if (this.notifPermissionGranted && !platforms.includes("mobileweb") && !platforms.includes("desktop")) {
                // notification specific setup
                //
                // TODO TODO TODO TODO TODO TODO TODO TODO
                //
                this.refreshNotificationList();
                //LocalNotifications.registerActionTypes({types: [{id: "completeOrSnooze", actions: [{id:"complete", title: "LOCALIZE: Complete", requiresAuthentication: "true", foreground: "false"}, {id:"snooze", title: "LOCALIZE: Snooze", requiresAuthentication: "true", foreground: "false"}]}]});
            }
            LocalNotifications.addListener("localNotificationActionPerformed", this.handleNotificationAction);
        }).bind(this));

        this.hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));

        this.e = engine;
        this.refresher = ()=>{};
        this.globalRefresher = ()=>{};
        this.callbackRefresherReleased = true; // prevent live callback merge conflicts
        this.conflictResolution = 2000; // 1000 ms = 1s worth of conflict time.
        this.releaseTimeout = undefined;

        this.doers = {
            macro: {
                applyOrder: async function (options) {
                    // TODO undo handler?
                    if (options.items.length !== options.order.length)
                        console.error("Length of items and order length must be the same!")
                    await Promise.all(options.order.map((e,i) => {
                        let item = options.items[e];
                        if (item.type === "task")
                            return engine.db.modifyTask(options.uid, item.content, {order: i});
                        else if (item.type === "project")
                            return engine.db.modifyProject(options.uid, item.content, {order: i});
                            //await engine.db.modifyProject(options.uid, e.content, {order: options.order[i]});
                    }));
                    return {uid:options.uid}; // TODO HANDLE UNDO
                }
            },
            tag: {
                create: async function (options) {
                    let newTag = await engine.db.newTag(options.uid, options.name);
                    return {uid: options.uid, id: newTag};
                },
                update: async function (options) {
                    await engine.db.setTag(options.uid, options.tid, options.query)

                    return {message: "TODO"}
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
                        name: options.name?options.name:"",
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
                    if (tInfo.delegatedWorkspace && tInfo.delegatedWorkspace !== "")
                        if (options.query.due || options.query.defer)
                            await engine.db.modifyTask(tInfo.delegatedWorkspace, tInfo.delegatedTaskID, options.query, true);
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
                    if (taskInfo.delegatedWorkspace && taskInfo.delegatedWorkspace !== "")
                        await engine.db.modifyTask(taskInfo.delegatedWorkspace, taskInfo.delegatedTaskID, {isComplete: true, completeDate: new Date()}, true);
                    if (engine.db.getWorkspaceMode() && taskInfo.delegations)  {
                        taskInfo.delegations.map((invite) => engine.db.revokeTaskToUser(options.uid, invite, options.tid));
                    }

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

                        } else if (rRule === "weekly") {
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
                create: async function (options) { // create project
                    let projObj = {
                        name: "",
                        top_level: options.parent === undefined,
                        is_sequential: false,
                    };
                    let npid = options.parent ? await engine.db.newProject(options.uid, projObj, options.parent) : await engine.db.newProject(options.uid, projObj) // make a project... with or without a parent
                    if (options.parent) {
                        engine.db.associateProject(options.uid, npid, options.parent);
                    }// associate the two
                    return {uid: options.uid, pid: npid}
                },
                delete: async function (options) {
                    await engine.db.deleteProject(options.uid, options.pid);
                    if (options.parent)
                        engine.db.dissociateProject(options.uid, options.pid, options.parent);

                    return {uid: options.uid, TODO: "TODO"} // TODO: how do we undelete a project?
                },
                update__name: async function (options) { // update the project name!
                    let possibleProjects = await engine.db.getProjectsandTags(options.uid);
                    // get all possible project
                    let projectName = possibleProjects[0][0][options.id]
                    // get the one we want based on page id

                    // modify the project
                    await engine.db.modifyProject(options.uid, options.id, {name: options.name});
                    // return what we need to undo
                    return {projectName, uid: options.uid}
                },
		update__complete: async function (options) {
                    await engine.db.modifyProject(options.uid, options.id,
			{
			    isComplete: true,
			    completeDate: new Date()
			}
		    );


		},
		update__uncomplete: async function (options) {
                    await engine.db.modifyProject(options.uid, options.id,
			{
			    isComplete: false
			}
		    );


		},
                update__pstate: async function (options) { // update the project name!
                    let currentProject = await engine.db.getProjectStructure(options.uid, options.id, false); // get current project info
                    // get all possible project
                    let is_sequential = currentProject;
                    // get the one we want based on page id

                    // modify the project
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
                create: async function(options) {
                    let pObj = {
                        name: "",
                        avail: "remain",
                        tord: "duds",
                        query: ""
                    }
                    let npspid = await engine.db.newPerspective(options.uid, pObj);
                    return {uid: options.uid, pid: npspid};
                },
                update__perspective: async function (options) { // update the perspective name!
                    let possiblePerspectives = await engine.db.getPerspectives(options.uid);
                    // get all possible perspectives
                    let perspectiveObject = possiblePerspectives[0][options.id]
                    // get the one we want based on page id

                    // modify the perspective
                    await engine.db.modifyPerspective(options.uid, options.id, options.payload);

                    // return what we need to undo
                    return {perspectiveObject, uid: options.uid}
                },

                delete__perspective: async function (options) { // update the perspective name!
                    console.log("perspective delete gruntman func")
                    // TODO: is this it? @jack
                    await engine.db.deletePerspective(options.uid, options.id);
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

        // @core-devs will not approve but I am secretly hiding
        // a copy of localized strings in gruntman
        this.secretLocalizedStrings = {};

        // And AutoBind any and all functions
        autoBind(this);
    }

    get localizations() {
        return this.secretLocalizedStrings;
    }

    set localizations(value) {
        this.secretLocalizedStrings = value;
    }

    halt() {
        for (let key in this.schedulers)
            clearTimeout(this.schedulers[key])
        this.refresher = ()=>{};
        if (this.updateInterval)
            clearTimeout(this.updateInterval);
        this.updateInterval = undefined;
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
        if (!this.updateLock && this.callbackRefresherReleased) {
            this.refresher();
            this.globalRefresher();
        }
    }

    async scheduleNotification(id, uid, title, desc, time) {
        this.refreshNotificationList();
        return await LocalNotifications.schedule({
            notifications: [
                {
                    title: title,
                    body: desc,
                    schedule: { at: time},
                    sound: null,
                    id: this.hashCode(id),
                    attachments: [`${id}`, `${uid}`],
                    extra: uid,
                }
            ]
        });
    }

    async handleNotificationAction(action) {
        this.refreshNotificationList();
        let [taskID, userID] = action.notification.attachments;
        switch (action.actionId) {
            case "complete":
                // TODO TODO
                this.do("task.update__complete", { uid: userID, tid: taskID}, true)
                break;
            case "snooze":
                // TODO TODO
                taskID = action.notification.attachments;
                userID = action.notification.extra;
                break;
        }
    }

    async refreshNotificationList() {
        this.notifList = await LocalNotifications.getPending();
    }

    async cancelNotification(id) {
        this.refreshNotificationList();
        return await LocalNotifications.cancel({notifications: [{id:`${this.hashCode(id)}`}]});
    }

    async checkNotification(id) {
        let expectedID = this.hashCode(id);
        let needed = this.notifList.notifications.map(e=>e.id).filter(e=>e==expectedID); // two equal signs to ignore type
        return needed.length > 0;
    }

    registerGlobalRefresher(r) {
        this.refreshNotificationList();
        this.globalRefresher=r;
        this.callbackRefresherReleased= false;
        this.releaseTimeout = setTimeout(()=>{this.callbackRefresherReleased=true; this.releaseTimeout=undefined}, this.conflictResolution);

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

