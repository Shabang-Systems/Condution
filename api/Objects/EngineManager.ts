import Workspace from "./Workspace";
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
    private _workspaces:string[]; // current workspace IDs
    private authenticatable:boolean = false; // are we currently authenticated?
    private ready:boolean = false // are the workspaces loaded?

    constructor(refManager:ReferenceManager, initializeWithoutAuth:boolean=false) {
        this.rm = refManager;
        
        if (!initializeWithoutAuth && this.rm.currentProvider.authSupported) {
            console.assert(this.rm.currentProvider.authenticationProvider.authenticated, "CondutionEngine: requested context initialization with auth but provider not authenticated.");
            this.ticketID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.userID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.authenticatable = true;
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
    }


    /**
     * 
     * @method useProvider
     *
     * use the specified provider in the context
     *
     * @param {string} providerName the name of the provider you wish to use
     * @returns {void}
     *
     */

    useProvider(providerName:string):void {
        this.rm.use(providerName);

        if (this.rm.currentProvider.authSupported) {
            console.assert(this.rm.currentProvider.authenticationProvider.authenticated, "CondutionEngine: requested context with auth but provider not authenticated.");
            this.ticketID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.userID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.authenticatable = true;
        } else {
            this.ticketID = "hard-storage-user";
            this.userID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.authenticatable = false;
        }
    }
    
    /**
     * @property identifier
     *
     * The current workspace/user ID
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
     * @returns {FirebaseCollection} the collection ye wished for
     *
     */
    
    collection(target:string[], forceUserland:boolean=false): Collection {
        let top:string[] = (this.isWorkspace && !forceUserland) ? ["workspaces", this.ticketID] : ["users", this.ticketID];
        return this.rm.collection(top.concat(target));
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



