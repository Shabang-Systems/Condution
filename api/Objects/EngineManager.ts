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
    private authenticatable:boolean = false; // are we currently authenticated?

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
     * @method useProvider
     *
     * use the specified provider in the context
     *
     * @param {string} providerName: the name of the provider you wish to use
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
     * @property identifier
     *
     * The currentuser ID, regardless of workspace status
     *
     */

    get identifier_() {
        return this.userID;
    }

    /**
     *
     * @method collection_
     *
     * You probably don't want to use me use collection() instead
     * Gets a collection, with is a list of pages, and some other stuff to operate on
     * **ALWAYS USE USERMODE, AND NOT WORKSPACE MODE**
     *
     * Example:
     *
     * > let ref = manager.collection("users, "test", "tasks");
     * > let pages = ref.pages();

     *
     * @param {string[]} path: path that you desire to get a reference to
     * @returns {FirebaseCollection}: the collection ye wished for
     *
     */
    
    collection_(target:string[]): Collection {
        return this.rm.collection(["users", this.userID].concat(target));
    }

    /**
     *
     * @method page_
     *
     * You probably don't want to use me. Use page() instead
     * Gets a Page to operate on
     * **ALWAYS USE USERMODE, AND NOT WORKSPACE MODE**
     *
     * Example:
     *
     * > let ref = manager.page("users, "test", "tasks", "434d5fab10129a");
     * > let values = ref.get();
     *
     * @param {string[]} path: path that you desire to get a reference to
     * @param {Function} refreshCallback: the callback to update when data gets refreshed
     * @returns {Page}: the page ye wished for
     *
     */

    page_(target:string[], refreshCallback?:Function): Page {
        return this.rm.page(["users", this.userID].concat(target), refreshCallback);
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
     * @param {string[]} path: path that you desire to get a reference to
     * @returns {FirebaseCollection}: the collection ye wished for
     *
     */
    
    collection(target:string[]): Collection {
        let top:string[] = this.isWorkspace ? ["workspaces", this.ticketID] : ["users", this.ticketID];
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
     * @param {string[]} path: path that you desire to get a reference to
     * @param {Function} refreshCallback: the callback to update when data gets refreshed
     * @returns {Page}: the page ye wished for
     *
     */

    page(target:string[], refreshCallback?:Function): Page {
        let top:string[] = this.isWorkspace ? ["workspaces", this.ticketID] : ["users", this.ticketID];
        return this.rm.page(top.concat(target), refreshCallback);
    }
}



