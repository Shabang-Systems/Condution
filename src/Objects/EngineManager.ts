import Workspace from "./Workspace";
import { GloballySelfDestruct } from "./Utils";
import ReferenceManager from "../Storage/ReferenceManager";
import { Page, Collection } from "../Storage/Backends/Backend"; 

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
    private _chains:string[] = []; // current workspace IDs
    private authenticatable:boolean = false; // are we currently authenticated?
    private ready:boolean = false // are the workspaces loaded?
    private defaultUsername:string; // defaultUsername

    constructor(refManager:ReferenceManager, initializeWithoutAuth:boolean=false, defaultUsername:string="hard-storage-user") {
        this.rm = refManager;
        this.defaultUsername = defaultUsername;
        
        if (!initializeWithoutAuth && this.rm.currentProvider.authSupported) {
            console.assert(this.rm.currentProvider.authenticationProvider.authenticated, "CondutionEngine: requested context initialization with auth but provider not authenticated.");
            this.ticketID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.userID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.authenticatable = true;
        } else {
            this.ticketID = defaultUsername;
            this.userID = defaultUsername;
        }
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
        this._workspaces = (await this.rm.page(["users", this.userID], (newPrefs:object)=>{this._workspaces = newPrefs["workspaces"]}).get())["workspaces"];
        this._chains = (await this.rm.page(["users", this.userID], (newPrefs:object)=>{this._chains = newPrefs["chains"]}).get())["chains"];
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
        // TODO TODO BROKEN
        console.log("THIS IS VERY BROKEN");
        GloballySelfDestruct();
        this.rm.use(providerName);

        if (this.rm.currentProvider.authSupported) {
            this.ticketID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.userID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.authenticatable = true;
        } else {
            this.ticketID = this.defaultUsername;
            this.userID = this.defaultUsername;
        }

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
    }

    /**
     * Switch data source to the personal workspace
     * 
     * @param{Workspace?} workspace    workspace to use, pass nothing for personal workspace
     * @returns{void}
     */

    usePersonalWorkspace():void {
        this.useWorkspace();
    }

    async acceptWorkspace(workspace:Workspace):Promise<void> {
        this._workspaces.push(workspace.id);
        await this.rm.page(["users", this.userID]).update({"workspaces": this._workspaces});
    }

    async rescindWorkspace(workspace:Workspace):Promise<void> {
        this._workspaces = this._workspaces.filter((id:string) => id !== workspace.id);
        await this.rm.page(["users", this.userID]).update({"workspaces": this._workspaces});
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



