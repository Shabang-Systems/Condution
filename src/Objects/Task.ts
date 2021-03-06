import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";
import { RepeatRule } from "./Utils";

export default class Task {
    private static cache:Map<string, Task> = new Map();

    private _id:string;
    private page:Page;
    private data:object;
    private context:Context;

    protected constructor(identifier:string, context:Context) {
        this._id = identifier;
        this.context = context;
    }

    /**
     * Fetch a task by Context and ID
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the task you want to fetch
     * @returns{Promise<Task>} the desired task
     *
     */

    static async fetch(context:Context, identifier:string):Promise<Task> {
        let cachedTask:Task = Task.cache.get(identifier);
        if (cachedTask)
            return cachedTask;

        let tsk:Task = new this(identifier, context);
        let page:Page = context.page(["tasks", identifier], tsk.update);

        tsk.data = await page.get();
        tsk.page = page;

        Task.cache.set(identifier, tsk);
        return tsk;
    }

    /**
     * TODO
     * Create a workspace based on context and owner email
     * @static
     *
     * @param{Context} context    the context that you are creating from
     * @param{string} email    the workspace owner's email
     * @returns{Promise<Workspace>} the desired workspace
     *
     */

    //static async create(context:Context, email:string):Promise<Workspace> {
        //let newWorkspace:DataExchangeResult = await context.referenceManager.collection(["workspaces"]).add({meta: {editors: [email], name:""}});

        //let wsp:Workspace = new this(newWorkspace.identifier, context);
        //let page:Page = context.referenceManager.page(["workspaces", newWorkspace.identifier], wsp.update);
        //wsp.data = await page.get();
        //wsp.page = page;

        //context.acceptWorkspace(wsp);

        //Workspace.cache.set(newWorkspace.identifier, wsp);
        //return wsp;
    //}

    /**
     * The identifier of the task
     * @property
     *
     */

    get id() {
        return this._id;
    }

    /**
     * The name of the task
     * @property
     *
     */

    get name() {
        return this.data["name"];
    }

    /**
     * The name of the task
     * @property
     *
     */

    set name(newName:string) {
        this.data["name"] = newName;
        this.sync();
    }

    
    /**
     * The description of the task
     * @property
     *
     */

    get description() {
        return this.data["desc"];
    }

    /**
     * The description of the task
     * @property
     *
     */

    set description(newDesc:string) {
        this.data["desc"] = newDesc;
        this.sync();
    }

    /**
     * The due date of the task
     * @property
     *
     * There exists special handling because
     * for some reason dates were stored by secs + nanosecs
     * in the past. IDK why
     *
     */

    get due() {
        if (this.data["due"])
            return new Date(this.data["due"]["seconds"]*1000);
        else return null;
    }

    /**
     * The due date of the task
     * @property
     *
     * There exists special handling because
     * for some reason dates were stored by secs + nanosecs
     * in the past. IDK why
     *
     */

    set due(dueDate: Date) {
        this.data["due"] = {seconds: Math.floor(dueDate.getTime()/1000), nanoseconds:0};
        this.page.set({due: dueDate}, {merge:true}); // weird date handling
                                                     // because IDK why this
                                                     // this used to be so yeah
    }

    /**
     * The defer date of the task
     * @property
     *
     * There exists special handling because
     * for some reason dates were stored by secs + nanosecs
     * in the past. IDK why
     *
     */

    get defer() {
        if (this.data["defer"])
            return new Date(this.data["defer"]["seconds"]*1000);
        else return null;
    }

    /**
     * The defer date of the task
     * @property
     *
     * There exists special handling because
     * for some reason dates were stored by secs + nanosecs
     * in the past. IDK why
     *
     */

    set defer(deferDate: Date) {
        this.data["defer"] = {seconds: Math.floor(deferDate.getTime()/1000), nanoseconds:0};
        this.page.set({defer: deferDate}, {merge:true}); // weird date handling
                                                     // because IDK why this
                                                     // this used to be so yeah
    }

    get repeat() {
        return RepeatRule.encode(this.data["repeat"]);
    }

    /**
     * The completeness of a task
     * @property
     *
     */

    get isComplete() {
        return this.data["isComplete"];
    }

    private sync = () => {
        this.page.set(this.data);
    }

    private update = (newData:object) => {
        this.data = newData;
    }

    get tempData() {
        return this.data;
    }
}

