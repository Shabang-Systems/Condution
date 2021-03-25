import type { AdapterData } from "./Utils";

import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";
import { RepeatRule, RepeatRuleType } from "./Utils";
import Project, { ProjectSearchAdapter } from "./Project";
import Tag, { TagSearchAdapter } from "./Tag";

class Task {
    private static cache:Map<string, Task> = new Map();
    static readonly databaseBadge = "tasks";

    private _id:string;
    private page:Page;

    private hooks:((arg0: Task)=>any)[] = [];

    protected data:object;
    protected _ready:boolean;
    protected _weight:number;
    protected _available:boolean;
    protected context:Context;


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
        Task.cache = new Map();
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

        Task.cache.set(identifier, tsk);

        await tsk.calculateTreeParams();

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
            await tsk.calculateTreeParams();
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
        tsk._ready = true;

	// TODO: Investigate optimization impact
        if (project) {
            await project.readinessPromise;
            project.associate(tsk);
        }

        Task.cache.set(newTask.identifier, tsk);

        await tsk.calculateTreeParams();

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
     * Update the order of the task
     * @async
     *
     * @param{number} newOrder    the new desired order
     * @returns{Promise<void>}
     *
     */

    async reorder(newOrder:number) : Promise<void> {
        this.data["order"] = newOrder;
        await this.calculateTreeParams();
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
        if (this._ready && this.data["project"] !== '') {
            return Project.lazy_fetch(this.context, this.data["project"]);
        }
    }

    /**
     * The project of the task, fetched traditionally/asycronously
     * @property
     *
     */

    get async_project() {
        this.readiness_warn();
        if (this._ready && this.data["parent"] && this.data["project"] !== '')
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
        if (this.data["parent"] && this.data["project"] !== "")
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
     * The complete date of the task
     * @property
     *
     * There exists special handling because
     * for some reason dates were stored by secs + nanosecs
     * in the past. IDK why
     *
     */

    get completeDate() {
        this.readiness_warn();
        if (this._ready && this.data["completeDate"])
            return new Date(this.data["completeDate"]["seconds"]*1000);
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
            await (await this.async_project).calculateTreeParams();

        let completeDate = new Date();
        this.data["completeDate"] = {seconds: Math.floor(completeDate.getTime()/1000), nanoseconds:0};
        await this.page.set({completeDate: completeDate}, {merge:true}); // weird date handling

        await this.calculateTreeParams();
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
            await (await this.async_project).calculateTreeParams();
        await this.calculateTreeParams();
        this.sync();
    }

    /**
     * get availablitiy of the task
     * @param
     *
     */

    get available() : boolean {
        return this._available;
    }

    /**
     * the DB badge of this object type
     * @param
     *
     */

    get databaseBadge() : string {
        return "tasks";
    }

    /**
     * DFS + lift to get weight and availibilty of the task wrt its directory
     *
     * Generally, you don't have a need to call this
     * and you should simply let this happen automagically
     * as tasks change and as other stuff happen like fetch
     * or create. However, you could force a tree flush
     * for your entertainment if you really wanted to.
     *
     * @returns{Promise<void>}
     *
     */

    calculateTreeParams = async () : Promise<void> => {
        // Get the tags
        let tags: Tag[] = await Promise.all(this.async_tags ? this.async_tags : []);

        // Set base weight
        let weight = 1;

        // For each tag, multiply weight
        tags.forEach((tag: Tag) => weight *= tag.weight);

        // Set the weight
        this._weight = weight;

        // Get project parents
        let project:Project = await this.async_project;

        // If there is a parent
        if (project) {

            // If the parent is sequential
            if (project.isSequential)
                this._available = (project.available && this.order == 0 && new Date() > this.defer); // Availibilty is calculated based on order
            else
                this._available = (project.available && new Date() > this.defer); // The availibilty is only based on the availibilty of project
        } else if (this.isComplete == true)
            this._available = false; // otherwise, its not available
        else  // if no parents
            this._available = new Date() > this.defer // the availibilty is controlled only by defer
    }

    /**
     * Hook a callback to whence this task updates
     *
     * @param{((arg0: Task)=>any)} hookFn    the function you want to hook in
     * @returns{void}
     *
     */

    hook(hookFn: ((arg0: Task)=>any)): void {
        this.hooks.push(hookFn);
    }

    /**
     * Unook a hooked callback to whence this task updates
     *
     * @param{((arg0: Task)=>any)} hookFn    the function you want to unhook
     * @returns{void}
     *
     */

    unhook(hookFn: ((arg0: Task)=>any)): void {
        this.hooks = this.hooks.filter((i:any) => i !== hookFn);
    }

    protected sync = () => {
        this.page.set(this.data);
        this.hooks.forEach((i:Function)=>i(this));
    }

    private update = (newData:object) => {
        if (this._ready)  {
            this.hooks.forEach((i:Function)=>i(this));
            this.calculateTreeParams();
        }
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

class TaskSearchAdapter extends Task {
    adaptorData: AdapterData;
    private static adaptorCache:Map<string, TaskSearchAdapter> = new Map();

    constructor(context:Context, id:string, data:AdapterData) {
        super(id, context);

        this.data = data.taskCollection.filter((obj:object)=> obj["id"] === id)[0];
        if (!this.data) 
            this.data = {}

        this.adaptorData = data;
        this._ready = true;
    }

    protected sync = () => {
        console.warn("You tried to edit the value of an object in the middle of a search adaptor. That's an awfully bad idea. Don't do that. No stop.");
    }

    get async_tags() {
        return this.data["tags"] ? this.data["tags"].map((tagID:string) => TagSearchAdapter.seed(this.context, tagID, this.adaptorData)) : null;
    }

    get async_project() {
        return this.data["project"] !== "" ? ProjectSearchAdapter.seed(this.context, this.data["project"], this.adaptorData) : null;
    }

    /**
     * Produce the desired object
     *
     * @param{Context} context    the context that you are seeding from
     * @param{string} id    the id of the object desired
     * @param{object} data    the seed data
     *
     */

    async produce() : Promise<Task> {
        return await Task.fetch(this.context, this.id);
    }

    /**
     * Seed a searchable item
     *
     * @param{Context} context    the context that you are seeding from
     * @param{string} id    the id of the object desired
     * @param{object} data    the seed data
     *
     */

    static async seed(context:Context, identifier:string, data:AdapterData) {
        let cachedTask:TaskSearchAdapter = TaskSearchAdapter.adaptorCache.get(identifier);
        if (cachedTask) return cachedTask;

        let tsk:TaskSearchAdapter = new this(context, identifier, data);

        TaskSearchAdapter.adaptorCache.set(identifier, tsk);
        await tsk.calculateTreeParams();

        return tsk;
    }

    /**
     * Nuke the cache
     * @static
     *
     * @returns{void}
     */

    static cleanup = () : void => {
        delete TaskSearchAdapter.adaptorCache;
        TaskSearchAdapter.adaptorCache = new Map();
    }
}


export { TaskSearchAdapter };
export default Task;

