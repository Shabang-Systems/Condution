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

    unlockUpdates() { 
        this.updateLock = false; 
        this.updateInterval = setTimeout(this.refresher, 500);
    }

    registerRefresher(r) {
        /*
         * @param refresher: refresher function to refresh what you registered
         */
        
        this.refresher = r;

    }

    registerScheduler(callback, identifier, wait=500) {
        if (this.schedulers[identifier])
            clearTimeout(this.schedulers[identifier]); // clear the timeout
        this.schedulers[identifier] = setTimeout(callback, wait);
    }

    async do(actionName, options, isUndo) {
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

        if (!this.updateLock)
            this.refresher();
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}
}

export default Gruntman;

