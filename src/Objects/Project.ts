import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";

export default class Project {
    private static cache:Map<string, Project> = new Map();

    private _id:string;
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

        page.get().then((data:object)=>{
            pj.data = data;
            pj._ready = true;
        });

        return pj;
    }

    /**
     * Create a tag based on context, name, and an optional weight
     * @static
     *
     * @param{ontext} context    the context that you are creating from
     * @param{string?} name    the tag's name
     * @param{number?} weight    the tag's weight
     * @returns{Promise<Tag>} the desired workspace
     *
     */

    /*static async create(context:Context, name?:string, weight?:number):Promise<Tag> {*/
        /*let newTag:DataExchangeResult = await context.collection(["tags"]).add({name, weight:weight?weight:1});*/

        /*let nt:Tag = new this(newTag.identifier, context);*/
        /*let page:Page = context.page(["tags", newTag.identifier], nt.update);*/
        /*nt.data = await page.get();*/
        /*nt.page = page;*/
        /*nt._ready = true;*/

        /*Tag.cache.set(newTag.identifier, nt);*/
        /*return nt;*/
    /*}*/

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

    set parent(parentProject:Project) {
        if (parentProject) {
            this.data["parent"] = parentProject.id;
            this.data["top_level"] = false;
        } else {
            this.data["parent"] = "";
            this.data["top_level"] = true;
        }
        // TODO TODO TODO ASSOCIATIONS ARE NOT WORKING!!
        this.sync();
    }

    /**
     * Bring the project to top level
     *
     * @returns{void}
     *
     */

    bringToTop(): void {
        this.parent = null;
    }

    /**
     * The parent of the project, fetched traditionally but asyncronously
     * @property
     *
     */

    get async_parent() {
        return this.data["parent"] ? Project.fetch(this.context, this.data["parent"]) : null;
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

    private readiness_warn = () => {
        if (!this._ready)
            console.warn("CondutionEngine: you tried to access an object that was fetched syncronously via lazy_fetch yet the underlying data has not yet been downloaded. You could only access the ID for the moment until data is downloaded. For Shame.");
    }

    private sync = () => {
        this.page.set(this.data);
    }

    private update = (newData:object) => {
        this.data = newData;
    }

}


