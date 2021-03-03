import { Page, Collection } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";

export default class Workspace {
    private static cache:Map<string, Workspace> = new Map();

    private id:String;
    private page:Page;
    private data:object;
    private context:Context;

    protected constructor(identifier:string, context:Context) {
        this.id = identifier;
        this.context = context;
    }

    /**
     * @static @method fetch
     *
     * Fetch a workspace by Context and ID
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
     * @method invite
     *
     * Invite a user to a workspace
     *
     * @param{string} email    the invitee's email
     * @returns{Promise<void>} 
     *
     */

    async invite(email: string):Promise<void> {
        console.error("TODO TODO this is WRONG!! IT DOES NOT ADD TO THE EDITOR LIST.");
        let invitations:Collection= this.context.referenceManager.collection(["invitations", email, "invites"]);
        await invitations.add({email, workspace: this.id, type: "invite", time: new Date()});
    }

    /**
     * @method revoke
     *
     * Revoke a user to a workspace
     *
     * @param{string} email    the invitee's email
     * @returns{Promise<void>} 
     *
     */

    async revoke(email: string):Promise<void> {
        console.error("TODO TODO this is WRONG!! IT DOES NOT ADD TO THE EDITOR LIST.");
        let invitations:Collection= this.context.referenceManager.collection(["invitations", email, "invites"]);
        await invitations.add({email, workspace: this.id, type: "revoke", time: new Date()});
    }


    /**
     * @property name
     *
     * The name of the workspace
     *
     */

    get name() {
        return this.data["meta"]["name"];
    }

    /**
     * @property name
     *
     * The name of the workspace
     *
     */

    set name(newName:string) {
        this.data["meta"]["name"] = newName;
        this.page.set(this.data);
    }

    private update = (newData:object) => {
        this.data = newData;
    }

}

