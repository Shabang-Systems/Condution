import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";
import { RepeatRule, RepeatRuleType } from "./Utils";
import Tag from "./Tag";

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
     * Nuke the cache
     * @static
     *
     */

    static SelfDestruct() {
        delete Task.cache;
        Task.cache = null;
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
     * Create a task based on a brouhaha of options
     * @static
     *
     * @param{Context} context    the context that you are creating from
     * @param{string?} name    the name of the new task
     * @param{string?} projectID    the project IDs of the new task
     * @param{string[]?} tagIDs    the tag IDs of the new task
     * @param{due} due    the due date of the new task
     * @param{defer} defer    the defer date of the new task
     * @returns{Promise<Workspace>} the desired workspace
     *
     */

    static async create(context:Context, name?:string, projectID?:string, tagIDs?:string[], due?:Date, defer?:Date):Promise<Task> {
        let blankRepeat:RepeatRule = new RepeatRule(RepeatRuleType.NONE);
        let newTask:DataExchangeResult = await context.collection(["tasks"]).add({
            name: name?name:"",
            project: projectID?projectID:"",
            tags: tagIDs?tagIDs:[],
            due: due?due:null,
            defer: defer?defer:new Date(),
            order: 1,
            isComplete: false,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            repeat: blankRepeat.decode()
        });

        let tsk:Task = new this(newTask.identifier, context);
        let page:Page = context.page(["tasks", newTask.identifier], tsk.update);

        tsk.data = await page.get();
        tsk.page = page;

        Task.cache.set(newTask.identifier, tsk);
        return tsk;
    }

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
     * The tag IDs of the task
     * @property
     *
     */

    get tagIDs() {
        return this.data["tags"];
    }

    /**
     * The tag IDs of the task
     * @property
     *
     */

    set tagIDs(newTags:string[]) {
        this.data["tags"] = newTags;
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
     * Whether the task has a floating timezone
     * @property
     *
     */

    get isFloating() {
        return this.data["isFloating"];
    }

    /**
     * Whether the task has a floating timezone
     * @property
     *
     */

    set isFloating(isFloating:boolean) {
        this.data["isFloating"] = isFloating;
        this.sync();
    }

    /**
     * Whether the task is flagged
     * @property
     *
     */

    get isFlagged() {
        return this.data["isFloating"];
    }

    /**
     * Whether the task is flagged
     * @property
     *
     */

    set isFlagged(isFlagged:boolean) {
        this.data["isFlagged"] = isFlagged;
        this.sync();
    }

    /**
     * The timezone of the task.
     * @property
     *
     * This property should be read only because it should only
     * be set when due/defer dates are set and is therefore done 
     * automagically when you do set those dates
     *
     */

    get timezone() {
        return this.data["timezone"];
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
        this.data["timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.page.set({due: dueDate, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}, {merge:true}); // weird date handling
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
        this.data["timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone
        this.page.set({defer: deferDate, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone}, {merge:true}); // weird date handling
                                                     // because IDK why this
                                                     // this used to be so yeah
    }

    /**
     * The repeat rule of the task
     * @property
     *
     */

    get repeatRule() {
        return RepeatRule.encode(this.data["repeat"]);
    }

    /**
     * The repeat rule of the task
     * @property
     *
     */

    set repeatRule(repeatRule:RepeatRule) {
        this.data["repeat"] = repeatRule.decode();
        this.sync();
    }

    /**
     * The completeness of a task
     * @property
     *
     */

    get isComplete() {
        return this.data["isComplete"];
    }

    /**
     * Complete the task!!
     *
     * @returns{void}
     *
     */

    complete() : void {
        if (this.repeatRule.isRepeating && this.due)
            [this.due, this.defer] = this.repeatRule.execute(this.due, this.defer);
        else
            this.data["isComplete"] = true;
        this.sync();
    }

    /**
     * uncomplete the task!!
     *
     * @returns{void}
     *
     */

    uncomplete() : void {
        this.data["isComplete"] = false;
        this.sync();
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

