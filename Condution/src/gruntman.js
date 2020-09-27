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
        this.refreshersToRefresh = {
            task: {
                update: ["view"]
            }
        }; // type:action:refreshers to refresh
        this.doers = {
            task: {
                update: async function (options) {
                    let tInfo = await this.e.db.getTaskInformation(options.uid, options.tid);
                    await this.e.db.modifyTask(options.uid, options.tid, options.query)

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
    }

    registerRefresher(r) {
        /*
         * @param refresher: refresher function to refresh what you registered
         */
        
        this.refresher = r;

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
        let refresher = this.refreshersToRefresh;
        while (nodes.length > 0) {
            action = action[nodes.shift()];
            refresher = refresher[nodes.shift()];
        }

        if (isUndo) this.undolog.push(actionID);
        else this.backlog.push(actionID);

        let resources = await action(options);

        this.taskLog[actionID] = [actionName, resources];

        this.refresher();
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}
}

export default Gruntman;

