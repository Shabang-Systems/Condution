import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";

export default class Tag {
    private static cache:Map<string, Tag> = new Map();

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
        delete Tag.cache;
        Tag.cache = null;
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
        let cachedWorkspace:Tag = Tag.cache.get(identifier);
        if (cachedWorkspace)
            return cachedWorkspace;

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
        let cachedWorkspace:Tag = Tag.cache.get(identifier);
        if (cachedWorkspace)
            return cachedWorkspace;

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
     * @returns{Promise<Tag>} the desired workspace
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

    private sync = () => {
        this.page.set(this.data);
    }

    private update = (newData:object) => {
        this.data = newData;
    }

}


