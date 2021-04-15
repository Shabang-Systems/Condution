import type { AdapterData } from "./Utils";

import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";

class Tag {
    public tempname: string; // modern problems require modern solutions, dw about it

    private static cache:Map<string, Tag> = new Map();
    static readonly databaseBadge = "tags";

    private hooks:((arg0: Tag)=>any)[] = [];

    private _id:string;
    private page:Page;

    protected data:object;
    protected context:Context;
    protected _ready:boolean;

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
        delete Tag.cache;
        Tag.cache = new Map();
    }

    /**
     * Fetch a tag by Context and ID
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the tag you want to fetch
     * @returns{Promise<Workspace>} the desired tag
     *
     */

    static async fetch(context:Context, identifier:string):Promise<Tag> {
        let cachedTag:Tag = Tag.cache.get(identifier);
        if (cachedTag)
            return cachedTag;

        let tg:Tag= new this(identifier, context);
        let page:Page = context.page(["tags", identifier], tg.update);
        tg.data = await page.get();
        tg.page = page;
        tg._ready = true;

        Tag.cache.set(identifier, tg);
        return tg;
    }

    /**
     * Fetch a tag by Context and ID without waiting database to load
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the tag you want to fetch
     * @returns{Promise<Tag>} the desired tag
     *
     */

    static lazy_fetch(context:Context, identifier:string):Tag {
        let cachedTag:Tag = Tag.cache.get(identifier);
        if (cachedTag)
            return cachedTag;

        let tg:Tag= new this(identifier, context);
        let page:Page = context.page(["tags", identifier], tg.update);

        tg.page = page;
        Tag.cache.set(identifier, tg);

        page.get().then((data:object)=>{
            tg.data = data;
            tg._ready = true;
        });

        return tg;
    }

    /**
     * Create a tag based on context, name, and an optional weight
     * @static
     *
     * @param{ontext} context    the context that you are creating from
     * @param{string?} name    the tag's name
     * @param{number?} weight    the tag's weight
     * @returns{Promise<Tag>} the desired tag
     *
     */

    static async create(context:Context, name?:string, weight?:number):Promise<Tag> {
        let newTag:DataExchangeResult = await context.collection(["tags"]).add({name, weight:weight?weight:1});

        let nt:Tag = new this(newTag.identifier, context);
        let page:Page = context.page(["tags", newTag.identifier], nt.update);
        nt.data = await page.get();
        nt.page = page;
        nt._ready = true;

        Tag.cache.set(newTag.identifier, nt);
        return nt;
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
     * The weight of the tag
     * @property
     *
     */

    get weight() {
        this.readiness_warn();
        if (this._ready)
            return this.data["weight"]?this.data["weight"]:1;
    }

    /**
     * The name of the tag
     * @property
     *
     */

    set weight(newWeight:number) {
        this.data["weight"] = newWeight;
        this.sync();
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
     * Delete the tag!!
     *
     * @returns{void}
     *
     */

    delete() : void {
        this.page.delete();
    }

    
    /**
     * Hook a callback to whence this task updates
     *
     * @param{((arg0: Tag)=>any)} hookFn    the function you want to hook in
     * @returns{void}
     *
     */

    hook(hookFn: ((arg0: Tag)=>any)): void {
        this.hooks.push(hookFn);
    }

    /**
     * Unook a hooked callback to whence this task updates
     *
     * @param{((arg0: Tag)=>any)} hookFn    the function you want to unhook
     * @returns{void}
     *
     */

    unhook(hookFn: ((arg0: Tag)=>any)): void {
        this.hooks = this.hooks.filter((i:any) => i !== hookFn);
    }
    /**
     * the DB badge of this object type
     * @param
     *
     */

    get databaseBadge() : string {
        return "tags";
    }

    private readiness_warn = () => {
        // TODO
//        if (!this._ready)
            //console.warn("CondutionEngine: you tried to access an object that was fetched syncronously via lazy_fetch yet the underlying data has not yet been downloaded. You could only access the ID for the moment until data is downloaded. For Shame.");
    }

    protected sync = () => {
        this.page.set(this.data);
        this.hooks.forEach((i:Function)=>i(this));
    }

    private update = (newData:object) => {
        if (this._ready)
            this.hooks.forEach((i:Function)=>i(this));
        this.data = newData;
    }

}

class TagSearchAdapter extends Tag {
    private static adaptorCache:Map<string, TagSearchAdapter> = new Map();

    constructor(context:Context, id:string, data:AdapterData) {
        super(id, context);

        this.data = data.tagCollection.filter((obj:object)=> obj["id"] === id)[0];
        if (!this.data) 
            this.data = {}
        this._ready = true;
    }

    protected sync = () => {
        console.warn("You tried to edit the value of an object in the middle of a search adaptor. That's an awfully bad idea. Don't do that. No stop.");
    }

    /**
     * Produce the desired object
     *
     * @param{Context} context    the context that you are seeding from
     * @param{string} id    the id of the object desired
     * @param{object} data    the seed data
     *
     */

    async produce() : Promise<Tag> {
        return await Tag.fetch(this.context, this.id);
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
        let cachedTag:TagSearchAdapter = TagSearchAdapter.adaptorCache.get(identifier);
        if (cachedTag) return cachedTag;

        let tsk:TagSearchAdapter = new this(context, identifier, data);
        TagSearchAdapter.adaptorCache.set(identifier, tsk);

        return tsk;
    }

    /**
     * Nuke the cache
     * @static
     *
     * @returns{void}
     */

    static cleanup = () : void => {
        delete TagSearchAdapter.adaptorCache;
        TagSearchAdapter.adaptorCache = new Map();
    }
}


export { TagSearchAdapter };
export default Tag;

