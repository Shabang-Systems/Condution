import Workspace from "./Workspace";
import { GloballySelfDestruct, Hookifier } from "./Utils";
import ReferenceManager from "../Storage/ReferenceManager";
import { Page, Collection, DataExchangeResult, AuthenticationUser } from "../Storage/Backends/Backend"; 

interface InviteNote {
    ws: Workspace ;
    inviteID: string;
};

/*
 * Hello Human,
 * I am Context!!
 *
 * Use me as the good'ol management
 * system for your task contexts.
 * 
 * For instance, set workspaces here,
 * because workspaces are a context property
 * of the current user info.
 * 
 * Stuff like that.
 * Also, I keep track of what ReferenceManager 
 * you are using.
 * 
 */

export class Context {
    private rm:ReferenceManager; // the ReferenceManager used by this context
    private ticketID:string; // current UID/Workspace ID
    private userID:string; // current UID
    private isWorkspace:boolean = false; // currently under workspaces mode
    private _workspaces:string[] = []; // current workspace IDs
    private _chains:object = {}; // current workspace IDs
    private authenticatable:boolean = false; // are we currently authenticated?
    private ready:boolean = false // are the workspaces loaded?
    private defaultUsername:string; // defaultUsername
    private _pendingAcceptances:InviteNote[] = []; // pending workspaces to accept

    constructor(refManager:ReferenceManager, defaultUsername:string="hard-storage-user") {
        this.rm = refManager;
        this.defaultUsername = defaultUsername;
        
        //if (!initializeWithoutAuth && this.rm.currentProvider.authSupported) {
            //console.assert(this.rm.currentProvider.authenticationProvider.authenticated, "CondutionEngine: requested context initialization with auth but provider not authenticated.");
            //let user:AuthenticationUser = await this.auth.currentUser;
            //this.ticketID = this.auth.currentUser.identifier;
            //this.userID = this.auth.currentUser.identifier;
            //this.authenticatable = true;
        //} else {
            //this.ticketID = defaultUsername;
            //this.userID = defaultUsername;
        //}
    }

    /**
     *
     * @method start
     *
     * Start the context by loading user info and workspaces. 
     * Call before doing anything!
     *
     * @returns {Promise<void>}
     *
     */

    async start():Promise<void> {
        if (this.rm.currentProvider.authSupported) {
            let user:AuthenticationUser = await this.auth.currentUser;
            this.ticketID = user.identifier;
            this.userID = user.identifier;
            this.authenticatable = true;
        } else {
            this.ticketID = this.defaultUsername;
            this.userID = this.defaultUsername;
        }

        // Get workspaces
        this._workspaces = (await this.rm.page(["users", this.userID], (newPrefs:object)=>{this._workspaces = newPrefs["workspaces"]}).get())["workspaces"];

        // Get chains
        this._chains = (await this.rm.page(["users", this.userID], (newPrefs:object)=>{this._chains = newPrefs["chains"]}).get())["chains"];

        // If authentication is supported, then
        // get chains and workspaces
        if (this.rm.currentProvider.authSupported) {

            // Get user email
            let email:string = (await this.auth.currentUser).email;

            // Get collection of invites
            this.rm.collection(["invitations", email, "invites"], async ()=>{
                // Get all invites
                let inviteData: object[] = await this.rm.collection(["invitations", email, "invites"]).data();

                // Sort most recent invite on top
                inviteData = inviteData.sort((b:object, a:object) => a["time"]["seconds"] - b["time"]["seconds"]);

                // Track whether or not item is seen
                // and reject all rejectinos while
                // tracking all pending invites

                let seen: string[] = [];
                let needResponse: InviteNote[] = [];

                await Promise.all(inviteData.map(async (i:object) => {
                    // If we have seen it already, its an older invite
                    // so delete it
                    if(seen.includes(i["workspace"])) {
                        this.rm.page(["invitations", email, "invites", i["id"]]).delete(); return;
                    }
                    seen.push(i["workspace"]);

                    // If its a revocation, revoke it and move on
                    if (i["type"] === "revoke") {
                        this.rescindWorkspace(i["workspace"], i["id"]);
                    } else {
                        // Finally, its probably a pending invite, so add it to the list
                        needResponse.push({ws: await Workspace.fetch(this, i["workspace"]), inviteID: i["id"]});
                    }
                }));

                this._pendingAcceptances = needResponse;
                Hookifier.call("context.workspace");
            });
                
            this.rm.collection(["invitations", email, "delegations"], async ()=>{
                let seenChains: string[] = [];

                // Get all invites
                let chainsData: object[] = await this.rm.collection(["invitations", email, "delegations"]).data();

                // Sort most recent invite on top
                chainsData = chainsData.sort((b:object, a:object) => a["time"]["seconds"] - b["time"]["seconds"]);

                await Promise.all(chainsData.map(async (i:object) => {
                    // If we have seen it already, its an older invite
                    // so delete it
                    if(seenChains.includes(i["task"])) {
                        this.rm.page(["invitations", email, "delegations", i["id"]]).delete(); return;
                    }
                    seenChains.push(i["task"]);

                    // If its a delegation
                    if (i["type"] === "delegation") {
                        // get the task
                        let taskObj:object = await this.rm.page(["workspaces", i["workspace"], "tasks", i["task"]]).get();
                        // Add the task to current user
                        let result:DataExchangeResult = await this.rm.collection(["users", this.userID, "tasks"]).add(Object.assign(taskObj, {project:"", tags:[], delegatedWorkspace: i["workspace"], delegatedTaskID: i["task"], delegations:[]}));
                        // Get the ID of new task, and set it to chains
                        this._chains[i["task"]] = result.identifier;

                        // Commit the chains and remove invite
                        await this.rm.page(["users", this.userID]).set({chains:this._chains, workspaces: this._workspaces});
                        await this.rm.page(["invitations", email, "delegations", i["id"]]).delete();
                    } else {
                        // Get the chained ID of the task
                        let taskID:string = this._chains[i["task"]];
                        if (!taskID) {
                            await this.rm.page(["invitations", email, "delegations", i["id"]]).delete(); return;
                        }

                        // Get the task
                        let taskPage:Page = this.rm.page(["users", this.userID, "tasks", taskID]);
                        let taskInfo:object = await taskPage.get();

                        // If there's a parent
                        if (taskInfo["project"] && taskInfo["project"] !== "") {
                            // Get the parent
                            let projectPage:Page = this.rm.page(["users", this.userID, "projects", taskInfo["project"]]);
                            let projectData:object = await projectPage.get();
                            // Remove the child ("dissociate")
                            let children:object = projectData["children"];
                            delete children[taskID];
                            projectData = Object.assign(projectData, {children});
                            // Commit to DB
                            projectPage.set(projectData);
                        }

                        // Delete task and delegation
                        await this.rm.page(["users", this.userID, "tasks", taskID]).delete();
                        await this.rm.page(["invitations", email, "delegations", i["id"]]).delete();
                    }
                }));

            });
        }

        this.ready = true;
    }


    /**
     * use the specified provider in the context
     *
     * @param {string} providerName     the name of the provider you wish to use
     * @returns {void}
     *
     */

    useProvider(providerName:string):void {
        this.rm.use(providerName);
    }

    /**
     * Switch data source to the given workspace
     * 
     * @param{Workspace?} workspace    workspace to use, pass nothing for personal workspace
     * @returns{void}
     */

    useWorkspace(workspace?:Workspace):void {
        if (workspace) 
            this.ticketID = workspace.id;
        else
            this.ticketID = this.userID;
        this.isWorkspace = workspace!==undefined;
        GloballySelfDestruct();
    }

    /**
     * Switch data source to the personal workspace
     * 
     * @param{Workspace?} workspace    workspace to use, pass nothing for personal workspace
     * @returns{void}
     */

    usePersonalWorkspace():void {
        this.useWorkspace();
        GloballySelfDestruct();
    }

    /**
     * Accept a workspace invite
     * 
     * @param{string} workspaceID    workspace ID to accept
     * @param{string?} inviteID    invite ID to delete
     */

    async acceptWorkspace(workspaceID:string, inviteID?:string):Promise<void> {
        let email:string = await this.userEmail();
        this._workspaces.push(workspaceID);
        await this.rm.page(["users", this.userID]).update({"workspaces": this._workspaces});
        if (inviteID)
            this.rm.page(["invitations", email, "invites", inviteID]).delete();

    }

    /**
     * Reject a workspace invite
     * 
     * @param{string} workspaceID    workspace ID to reject
     * @param{string?} inviteID    invite ID to delete
     */

    async rescindWorkspace(workspaceID:string, inviteID?:string):Promise<void> {
        let email:string = await this.userEmail();
        this._workspaces = this._workspaces.filter((id:string) => id !== workspaceID);
        await this.rm.page(["users", this.userID]).update({"workspaces": this._workspaces});
        if (inviteID)
            this.rm.page(["invitations", email, "invites", inviteID]).delete();
    }

    /**
     * Hook a function to invite changes
     *
     * @param{Function} hookFn    the fnuction to hook
     *
     * @returns{void}
     */

    hookInvite(hookFn:Function):void {
        Hookifier.push("context.workspace", hookFn);
    }

    /**
     * Unook a function to invite changes
     *
     * @param{Function} hookFn    the fnuction to unhook
     *
     * @returns{void}
     */

    unhookInvite(hookFn:Function):void {
        Hookifier.remove("context.workspace", hookFn);
    }

    /**
     * Pending workspace acceptances
     * @property
     *
     */

    get pendingAcceptances():InviteNote[] {
        return this._pendingAcceptances;
    }

    /**
     * The current workspace/user ID
     * @property
     *
     */

    get identifier() {
        return this.ticketID;
    }

    /**
     * @property userIdentifier
     *
     * The currentuser ID, regardless of workspace status
     *
     */

    get userIdentifier() {
        return this.userID;
    }


    /**
     * The user's email
     * @property
     */

    async userEmail() {
        if (this.rm.currentProvider.authSupported) {
            return (await this.auth.currentUser).email;
        } else return null;
    }


    /**
     * The user's name
     * @property
     */

    async userDisplayName() {
        if (this.rm.currentProvider.authSupported) {
            return (await this.auth.currentUser).displayName;
        } else return null;
    }

    /**
     * @property referenceManager
     *
     * The current ReferenceManager
     *
     */

    get referenceManager() {
        return this.rm;
    }


    /**
     * @method workspaces
     *
     * Get the current user's workspaces
     *
     */

    async workspaces() {
        return await Promise.all(this._workspaces.map(async i=>(await Workspace.fetch(this, i))));
    }

    /**
     * Authentication provider
     * @property
     *
     */

    get auth() {
        return this.rm.currentProvider.authenticationProvider;
    }

    /**
     * User is in workspace or no
     * @property
     *
     */

    get isInWorkspace() {
        return this.isWorkspace;
    }

    /**
     *
     * @method collection
     *
     * Gets a collection, with is a list of pages, and some other stuff to operate on
     *
     * Example:
     *
     * > let ref = manager.collection("users, "test", "tasks");
     * > let pages = ref.pages();

     *
     * @param {string[]} path  path that you desire to get a reference to
     * @param {boolean} forceUserland  return a page pointing to user db and not workspace db even if workspaces activated
     * @param {Function} refreshCallback: the callback to update when data gets refreshed
     * @returns {Collection} the collection ye wished for
     *
     */
    
    collection(target:string[], forceUserland:boolean=false, refreshCallback?:Function): Collection {
        let top:string[] = (this.isWorkspace && !forceUserland) ? ["workspaces", this.ticketID] : ["users", this.ticketID];
        return this.rm.collection(top.concat(target), refreshCallback);
    }

    /**
     *
     * @method page
     *
     * Gets a Page to operate on
     *
     * Example:
     *
     * > let ref = manager.page("users, "test", "tasks", "434d5fab10129a");
     * > let values = ref.get();
     *
     * @param {string[]} path path that you desire to get a reference to
     * @param {Function} refreshCallback the callback to update when data gets refreshed
     * @param {boolean} forceUserland  return a page pointing to user db and not workspace db even if workspaces activated
     * @returns {Page} the page ye wished for
     *
     */

    page(target:string[], refreshCallback?:Function, forceUserland:boolean=false): Page {
        let top:string[] = (this.isWorkspace && !forceUserland) ? ["workspaces", this.ticketID] : ["users", this.ticketID];
        return this.rm.page(top.concat(target), refreshCallback);
    }
}



