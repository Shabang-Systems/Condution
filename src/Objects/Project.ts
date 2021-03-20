import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import Task from "./Task";
import { Context } from "./EngineManager";

export default class Project {
    private static cache:Map<string, Project> = new Map();

    private _id:string;
    private page:Page;
    private data:object;
    private _weight:number;
    private context:Context;
    private _ready:boolean;
    private _readiness:Promise<void>;

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
        delete Project.cache;
        Project.cache = null;
    }

    /**
     * Fetch a project by Context and ID
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the project you want to fetch
     * @returns{Promise<Project>} the desired project
     *
     */

    static async fetch(context:Context, identifier:string):Promise<Project> {
        let cachedProject:Project = Project.cache.get(identifier);
        if (cachedProject && cachedProject._ready == true)
            return cachedProject;

        let pj:Project = new this(identifier, context);
        let page:Page = context.page(["projects", identifier], pj.update);
        pj.data = await page.get();
        pj.page = page;
        pj._ready = true;
        pj._readiness = new Promise((res, _) => res());
        await pj.flushweight();

        Project.cache.set(identifier, pj);
        return pj;
    }

    /**
     * Fetch a project by Context and ID without waiting database to load
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the project you want to fetch
     * @returns{Promise<Project>} the desired project
     *
     */

    static lazy_fetch(context:Context, identifier:string):Project {
        let cachedProject:Project = Project.cache.get(identifier);
        if (cachedProject)
            return cachedProject;

        let pj:Project = new this(identifier, context);
        let page:Page = context.page(["projects", identifier], pj.update);


        pj.page = page;
        Project.cache.set(identifier, pj);
        pj._readiness = new Promise((res, _) => {
            page.get().then(async (data:object)=>{
                pj.data = data;
                pj._ready = true;
                await pj.flushweight();
                res();
            });
        });

        return pj;
    }

    /**
     * Create a project based on context, and optionally name and parent
     * @static
     *
     * @param{Context} context    the context that you are creating from
     * @param{string?} name    the new project's name
     * @param{parent?} parent    the new project's parent
     * @returns{Promise<Project>} the desired project
     *
     */

    static async create(context:Context, name?:string, parent?:Project):Promise<Project> {
        let newProject:DataExchangeResult = await context.collection(["projects"]).add({
            name: name?name:"", 
            parent: parent?parent.id:"",
            top_level: parent?false:true,
            isComplete: false, // HUXLEY! SNAKE CASE
            is_sequential: false,
            children: {}
        });

        let np:Project = new this(newProject.identifier, context);
        let page:Page = context.page(["projects", newProject.identifier], np.update);
        np.data = await page.get();
        np.page = page;
        np._ready = true;

        if (parent) {
            await parent._readiness;
            parent.associate(np);
        }

        await np.flushweight();
        Project.cache.set(newProject.identifier, np);
        return np;
    }

    /**
     * The name of the tag
     * @property
     *
     */

    get name() {
        this.readiness_warn();
        if (this._ready)
            return this.data["name"];
    }

    /**
     * The name of the tag
     * @property
     *
     */

    set name(newName:string) {
        this.data["name"] = newName;
        this.sync();
    }

    /**
     * The sequentiality of the project
     * @property
     *
     */

    get isSequential() {
        this.readiness_warn();
        if (this._ready)
            return this.data["is_sequential"];
    }

    /**
     * The sequentiality of the project
     * @property
     *
     */

    set isSequential(newSequentiality:boolean) {
        this.data["is_sequential"] = newSequentiality;
        this.sync();
    }

    /**
     * The completeness of the project
     * @property
     *
     */

    get isComplete() {
        this.readiness_warn();
        if (this._ready)
            return this.data["isComplete"]; // not a mistake. Blame Huxley.
    }

    /**
     * The completeness of the project
     * @property
     *
     */

    set isComplete(newCompleteness:boolean) {
        this.data["isComplete"] = newCompleteness;
        this.sync();
    }
    
    /**
     * The order of the project
     * @property
     *
     */

    get order() {
        this.readiness_warn();
        if (this._ready)
            return this.data["order"];
    }

    set order(newOrder:number) {
        this.data["order"] = newOrder;
        this.sync();
    }

    /**
     * Whether the project is a top level project
     * @property
     *
     */

    get topLevel() {
        this.readiness_warn();
        if (this._ready)
            return this.data["top_level"];
    }

    /**
     * The parent of the project
     * @property
     *
     */

    get parent() {
        this.readiness_warn();
        if (this._ready)
            return this.data["parent"] ? Project.lazy_fetch(this.context, this.data["parent"]) : null;
    }

     /**
     * Move the project to...
     *
     * @param{Project?} to    to a project or, if null, to inbox
     * @returns{Promise<void>}
     *
     */

    async move(to?:Project): Promise<void> {
        if (this.data["parent"] !== "")
            await (await Project.fetch(this.context, this.data["parent"])).dissociate(this);
        if (to) {
            await to.readinessPromise;
            await to.associate(this);
            this.data["parent"] = to.id;
            this.data["top_level"] = false;
        } else {
            this.data["parent"] = "";
            this.data["top_level"] = true;
        }
        this.sync();
    }

    /**
     * Bring the project to top level
     *
     * @returns{Promise<void>}
     *
     */

    async bringToTop(): Promise<void> {
        await this.move();
    }

    /**
     * The parent of the project, fetched traditionally but asyncronously
     * @property
     *
     */

    get async_parent() {
        this.readiness_warn();
        if (this._ready)
            return this.data["parent"] ? Project.fetch(this.context, this.data["parent"]) : null;
    }

    /**
     * The child(ren) of the project
     * @property
     *
     */

    get children() {
        this.readiness_warn();
        let dataArray:(Project|Task)[] = [];
        if (this._ready) {
            for (let child in this.data["children"])
                if (this.data["children"][child] == "task")
                    dataArray.push(Task.lazy_fetch(this.context, child));
                else if (this.data["children"][child] == "project")
                    dataArray.push(Project.lazy_fetch(this.context, child));

            return dataArray;
        }
    }

    /**
     * Associate a task/project with the project's index
     * @async
     *
     * @param{Project|Task} item    the item you want to associate
     * @param{number?} order    force a specific order
     * @returns{Promise<void>}
     *
     */

    async associate(item:Project|Task, order?:number): Promise<void> {
        if (!order)
            order = Object.keys(this.children).length;
        item.order = order;
        this.data["children"][item.id] = (item instanceof Task) ? "task" : "project";
        await this.flushweight();
        this.sync();
    }

    /**
     * Dissociate a task/project with the project's index
     * @async
     *
     * @param{Project|Task} item    the item you want to dissociate
     * @returns{Promise<void>}
     *
     */

    async dissociate(item:Project|Task): Promise<void> {
        delete this.data["children"][item.id];
        await this.flushweight();
        this.sync();
    }

    /**
     * Associate a whole bunch of tasks/projects with the project's index
     * @async
     *
     * @param{(Project|Task)[]} items    the items you want to associate
     * @returns{Promise<void>}
     *
     */

    async batch_associate(items:(Project|Task)[]): Promise<void> {
        let order:number = Object.keys(this.children).length

        for (let i of items) {
            i.order = order;
            order++;
            this.data["children"][i.id] = (i instanceof Task) ? "task" : "project";
        }

        await this.flushweight();
        this.sync();
    }

    /**
     * Dissociate a whole bunch of tasks/projects with the project's index
     * @async
     *
     * @param{(Project|Task)[]} items    the items you want to dissociate
     * @returns{void}
     *
     */

    async batch_dissociate(items:(Project|Task)[]): Promise<void> {
        for (let i of items) {
            delete this.children[i.id];
        }

        await this.flushweight();
        this.sync();
    }

    /**
     * Delete the project!!
     *
     * @returns{void}
     *
     */

    delete() : void {
        this.page.delete();
    }

    /**
     * The child(ren) of the project, fetched traditionally with promises
     * @property
     *
     */

    get async_children() {
        this.readiness_warn();
        let dataArray:(Promise<Project>|Promise<Task>)[] = [];
        if (this._ready) {
            for (let child in this.data["children"])
                if (this.data["children"][child] == "task")
                    dataArray.push(Task.fetch(this.context, child));
                else if (this.data["children"][child] == "project")
                    dataArray.push(Project.fetch(this.context, child));
            return dataArray;
        }
    }

    /**
     * The identifier of the tag
     * @property
     *
     */

    get id() {
        return this._id;
    }

    /**
     * The readiness of the data
     * @property
     *
     */

    get ready() {
        return this._ready;
    }

    /**
     * A promise that tells you that the project is ready
     * @property
     *
     */

    get readinessPromise(): Promise<void> {
        return this._readiness;
    }


    /**
     * get weight of the project
     * @param
     *
     */

    get weight() : number {
        return this._weight;
    }

    /**
     * DFS though the project and calculate weight
     * @async
     *
     * Generally, you don't have a need to call this
     * and you should simply let this happen automagically
     * as tasks change and as other stuff happen like fetch
     * or create. However, you could force a weight flush
     * for your entertainment if you really wanted to.
     * 
     * @returns{Promise<void>}
     *
     */

    flushweight = async () : Promise<void> => {
        let weights:number[] = await Promise.all(this.async_children.map(async (i):Promise<number> => {
            return (await i).weight ;
        }));
        this._weight = 0;
        weights.forEach((i:number) => this._weight+=i);
    }

    private readiness_warn = () => {
        if (!this._ready)
            console.warn("CondutionEngine: you tried to access an object that was fetched syncronously via lazy_fetch yet the underlying data has not yet been downloaded. You could only access the ID for the moment until data is downloaded. For Shame.");
    }

    private sync = () => {
        this.page.set(this.data);
    }

    private update = (newData:object) => {
        this.flushweight();
        this.data = newData;
    }

}


