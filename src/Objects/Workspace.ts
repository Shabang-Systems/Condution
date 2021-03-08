import { Page, Collection, DataExchangeResult } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";

export default class Workspace {
    private static cache:Map<string, Workspace> = new Map();

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
        delete Workspace.cache;
        Workspace.cache = null;
    }

    /**
     * Fetch a workspace by Context and ID
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the workspace you want to fetch
     * @returns{Promise<Workspace>} the desired workspace
     *
     */

    static async fetch(context:Context, identifier:string):Promise<Workspace> {
        let cachedWorkspace:Workspace = Workspace.cache.get(identifier);
        if (cachedWorkspace)
            return cachedWorkspace;

        let wsp:Workspace = new this(identifier, context);
        let page:Page = context.referenceManager.page(["workspaces", identifier], wsp.update);
        wsp.data = await page.get();
        wsp.page = page;

        Workspace.cache.set(identifier, wsp);
        return wsp;
    }

    /**
     * Create a workspace based on context and owner email
     * @static
     *
     * @param{Context} context    the context that you are creating from
     * @param{string} email    the workspace owner's email
     * @returns{Promise<Workspace>} the desired workspace
     *
     */

    static async create(context:Context, email:string):Promise<Workspace> {
        let newWorkspace:DataExchangeResult = await context.referenceManager.collection(["workspaces"]).add({meta: {editors: [email], name:""}});

        let wsp:Workspace = new this(newWorkspace.identifier, context);
        let page:Page = context.referenceManager.page(["workspaces", newWorkspace.identifier], wsp.update);
        wsp.data = await page.get();
        wsp.page = page;

        context.acceptWorkspace(wsp);

        Workspace.cache.set(newWorkspace.identifier, wsp);
        return wsp;
    }

    /**
     * Invite a user to a workspace
     *
     * @param{string} email    the invitee's email
     * @returns{Promise<void>} 
     *
     */

    async invite(email: string):Promise<void> {
        if (!this.data["meta"]["editors"].includes(email))
            this.data["meta"]["editors"].push(email);
        this.sync();
        let invitations:Collection= this.context.referenceManager.collection(["invitations", email, "invites"]);
        await invitations.add({email, workspace: this._id, type: "invite", time: new Date()});
    }

    /**
     * Revoke a user to a workspace
     *
     * @param{string} email    the revokee's email
     * @returns{Promise<void>} 
     *
     */

    async revoke(email: string):Promise<void> {
        if (this.data["meta"]["editors"].includes(email))
            this.data["meta"]["editors"] = this.data["meta"]["editors"].filter((a:string)=>a!==email);
        this.sync();
        let invitations:Collection= this.context.referenceManager.collection(["invitations", email, "invites"]);
        await invitations.add({email, workspace: this._id, type: "revoke", time: new Date()});
    }

    /**
     * The name of the workspace
     * @property
     *
     */

    get name() {
        return this.data["meta"]["name"];
    }

    /**
     * The name of the workspace
     * @property
     *
     */

    set name(newName:string) {
        this.data["meta"]["name"] = newName;
        this.sync();
    }

    /**
     * The identifier of the workspace
     * @property
     *
     */

    get id() {
        return this._id;
    }

    /**
     * Collaborators of the workspace
     * @property
     *
     */

    get collaborators() {
        return this.data["meta"]["editors"];
    }
    
    private sync = () => {
        this.page.set(this.data);
    }

    private update = (newData:object) => {
        this.data = newData;
    }

}

