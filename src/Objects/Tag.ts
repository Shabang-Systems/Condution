import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";

export default class Tag {
    private static cache:Map<string, Tag> = new Map();

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

        Tag.cache.set(identifier, tg);
        return tg;
    }

    /**
     * Create a workspace based on context and owner email
     * @static
     *
     * @param{ontext} context    the context that you are creating from
     * @param{string} email    the workspace owner's email
     * @returns{Promise<Workspace>} the desired workspace
     *
     */

  /*  static async create(context:Context, email:string):Promise<Workspace> {*/
        /*let newWorkspace:DataExchangeResult = await context.referenceManager.collection(["workspaces"]).add({meta: {editors: [email], name:""}});*/

        /*let wsp:Workspace = new this(newWorkspace.identifier, context);*/
        /*let page:Page = context.referenceManager.page(["workspaces", newWorkspace.identifier], wsp.update);*/
        /*wsp.data = await page.get();*/
        /*wsp.page = page;*/

        /*context.acceptWorkspace(wsp);*/

        /*Workspace.cache.set(newWorkspace.identifier, wsp);*/
        /*return wsp;*/
    /*}*/

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
        return this.data["weight"];
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

    private sync = () => {
        this.page.set(this.data);
    }

    private update = (newData:object) => {
        this.data = newData;
    }

}


