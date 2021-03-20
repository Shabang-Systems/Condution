import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";
import { RepeatRule, RepeatRuleType } from "./Utils";
import Project from "./Project";
import Tag from "./Tag";

export default class Task {
    private static cache:Map<string, Task> = new Map();

    private _id:string;
    private _weight:number;
    private page:Page;
    private data:object;
    private context:Context;
    private _ready:boolean;

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
        if (cachedTask && cachedTask._ready == true)
            return cachedTask;

        let tsk:Task = new this(identifier, context);
        let page:Page = context.page(["tasks", identifier], tsk.update);

        tsk.data = await page.get();
        tsk._ready = true;
        tsk.page = page;
        await tsk.flushweight();

        Task.cache.set(identifier, tsk);
        return tsk;
    }

    static lazy_fetch(context:Context, identifier:string):Task {
        let cachedTask:Task = Task.cache.get(identifier);
        if (cachedTask)
            return cachedTask;

        let tsk:Task = new this(identifier, context);
        let page:Page = context.page(["tasks", identifier], tsk.update);
        tsk.page = page;
        Task.cache.set(identifier, tsk);

        page.get().then(async (data:object) => {
            tsk.data = data;
            tsk._ready = true;
            await tsk.flushweight();
        });

        return tsk;
    }

    /**
     * Create a task based on a brouhaha of options
     * @static
     *
     * @param{Context} context    the context that you are creating from
     * @param{string?} name    the name of the new task
     * @param{Project?} project    the project IDs of the new task
     * @param{Tag[]?} tags    the tag IDs of the new task
     * @param{due} due    the due date of the new task
     * @param{defer} defer    the defer date of the new task
     * @returns{Promise<Workspace>} the desired workspace
     *
     */

    static async create(context:Context, name?:string, project?:Project, tags?:Tag[], due?:Date, defer?:Date):Promise<Task> {
        let blankRepeat:RepeatRule = new RepeatRule(RepeatRuleType.NONE);
        let newTask:DataExchangeResult = await context.collection(["tasks"]).add({
            name: name?name:"",
            project: project?project.id:"",
            tags: tags?tags.map((tag:Tag)=>tag.id):[],
            due: due?due:null,
            defer: defer?defer:new Date(),
            order: 1, // TODO, actually set correct order
            isComplete: false,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            repeat: blankRepeat.decode()
        });

        let tsk:Task = new this(newTask.identifier, context);
        let page:Page = context.page(["tasks", newTask.identifier], tsk.update);

        tsk.data = await page.get();
        tsk.page = page;

	// TODO: Investigate optimization impact
        if (project) {
            await project.readinessPromise;
            project.associate(tsk);
        }

        await tsk.flushweight();
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
     * The order of the task
     * @property
     *
     */

    get order() {
        this.readiness_warn();
        if (this._ready)
            return this.data["order"];
    }

    /**
     * The order of the task
     * @property
     *
     */

    set order(newOrder:number) {
        this.data["order"] = newOrder;
        this.sync();
    }

    /**
     * The name of the task
     * @property
     *
     */

    get name() {
        this.readiness_warn();
        if (this._ready)
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
     * The project of the task
     * @property
     *
     */

    get project() {
        this.readiness_warn();
        if (this._ready && this.data["project"] !== '')
            return Project.lazy_fetch(this.context, this.data["project"]);
    }

    /**
     * The project of the task, fetched traditionally/asycronously
     * @property
     *
     */

    get async_project() {
        this.readiness_warn();
        if (this._ready)
            return Project.fetch(this.context, this.data["project"]);
    }

    /**
     * Move the task to...
     *
     * @param{Project?} to    to a project or, if null, to inbox
     * @returns{Promise<void>}
     *
     */

    async move(to?:Project): Promise<void> {
        if (this.data["project"] !== "")
            await (await Project.fetch(this.context, this.data["project"])).dissociate(this);
        if (to) {
            await to.readinessPromise;
            await to.associate(this);
            this.data["project"] = to.id;
        } else this.data["project"] = "";
        this.sync();
    }


    /**
     * Move the task to the inbox
     *
     * @returns{Promise<void>}
     *
     */

    async inboxify(): Promise<void> {
        await this.move(null);
    }

    /**
     * The tag IDs of the task, properly fetched
     * @property
     *
     */

    get async_tags() {
        this.readiness_warn();
        if (this._ready)
            return this.data["tags"].map((tagID:string) => Tag.fetch(this.context, tagID));
    }

     /**
     * The weight of the task
     * @property
     *
     */

    get weight() {
        this.readiness_warn();
        if (this._ready)
            return this._weight;
    }

    /**
     * The tag of the task
     * @property
     *
     */

    get tags() {
        this.readiness_warn();
        if (this._ready)
            return this.data["tags"].map((tagID:string) => Tag.lazy_fetch(this.context, tagID));
    }


    /**
     * The tag IDs of the task
     * @property
     *
     */

    set tags(newTags:Tag[]) {
        let newWeight = 1;
        this.data["tags"] = newTags.map((tag:Tag) => {
            
            if (!tag.ready)
                console.warn("CondutionEngine: you provided a tag ${tag.id} that was fetched using lazy_fetch but not yet initialized. Treating weight as 1. This task's tag weight will therefore be wrong for a little. Womp Womp.");
            else
                newWeight*=tag.weight;
            return tag.id
        });
        this._weight = newWeight;
        this.sync();
    }

    /**
     * The description of the task
     * @property
     *
     */

    get description() {
        this.readiness_warn();
        if (this._ready)
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
        this.readiness_warn();
        if (this._ready)
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
        this.readiness_warn();
        if (this._ready)
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
        this.readiness_warn();
        if (this._ready)
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
        this.readiness_warn();
        if (this._ready && this.data["due"])
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
        this.readiness_warn();
        if (this._ready && this.data["defer"])
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
        this.readiness_warn();
        if (this._ready)
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
        this.readiness_warn();
        if (this._ready)
            return this.data["isComplete"];
    }

    /**
     * Complete the task!!
     * @async
     *
     * @returns{Promise<void>}
     *
     */

    async complete() : Promise<void> {
        if (this.repeatRule.isRepeating && this.due)
            [this.due, this.defer] = this.repeatRule.execute(this.due, this.defer);
        else
            this.data["isComplete"] = true;

        if (this.project)
            await (await this.async_project).flushweight();
        this.sync();
    }

    /**
     * Delete the task!!
     *
     * @returns{void}
     *
     */

    delete() : void {
        this.page.delete();
    }

    /**
     * uncomplete the task!!
     * @async
     *
     * @returns{Promise<void>}
     *
     */

    async uncomplete() : Promise<void> {
        this.data["isComplete"] = false;
        if (this.project)
            await (await this.async_project).flushweight();
        this.sync();
    }

    /**
     * calculate the weight of the task
     *
     * @returns{Promise<void>}
     *
     */

    private flushweight = async () : Promise<void> => {
        let tags: Tag[] = await Promise.all(this.async_tags);
        let weight = 1;
        tags.forEach((tag: Tag) => weight *= tag.weight);
        this._weight = weight;
    }

    private sync = () => {
        this.page.set(this.data);
    }

    private update = (newData:object) => {
        this.flushweight();
        this.data = newData;
    }

    private readiness_warn = () => {
        if (!this._ready)
            console.warn("CondutionEngine: you tried to access an object that was fetched syncronously via lazy_fetch yet the underlying data has not yet been downloaded. You could only access the ID for the moment until data is downloaded. For Shame.");
    }

    get tempData() {
        return this.data;
    }
}

