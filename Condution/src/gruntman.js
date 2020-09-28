const { parseFromTimeZone } = require('date-fns-timezone')


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
        this.doers = {
            task: {
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
                                            case 7:
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
                                            case 7:
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

            }
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
    }

    lockUpdates() { 
        this.updateLock = true; 
        if (this.updateInterval)
            clearTimeout(this.updateInterval);
        this.updateInterval = undefined;
    }

    unlockUpdates(interval=500) { 
        this.updateLock = false; 
        this.updateInterval = setTimeout(this.refresher, interval);
    }

    /*
     * @param refresher: refresher function to refresh what you registered
     */

    registerRefresher = (r) => this.refresher = r;

    registerScheduler(callback, identifier, wait=500) {
        if (this.schedulers[identifier])
            clearTimeout(this.schedulers[identifier]); // clear the timeout
        this.schedulers[identifier] = setTimeout(callback, wait);
    }

    async do(actionName, options, bypassUpdates, isUndo) {
        /*
         * @param actionName => action directive like task.edit or project.create
         * @param options => options
         *
         */

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
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}
}

export default Gruntman;

