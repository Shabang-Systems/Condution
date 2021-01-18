import ReferenceManager from "../Storage/ReferenceManager";
import { Page, Collection } from "../Storage/Backends/Backend"; 

/*
 * Hello Human,
 * I am ContextManager!!
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

export class ContextManager {
    private rm:ReferenceManager; // the ReferenceManager used by this context
    private ticketID:string; // current UID/Workspace ID
    private isWorkspace:boolean = false; // currently under workspaces mode
    private authenticatable:boolean = false; // are we currently authenticated?

    constructor(refManager:ReferenceManager, initializeWithoutAuth:boolean=false) {
        this.rm = refManager;
        
        if (!initializeWithoutAuth && this.rm.currentProvider.authSupported) {
            console.assert(this.rm.currentProvider.authenticationProvider.authenticated, "CondutionEngine: requested context initialization with auth but provider not authenticated.");
            this.ticketID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.authenticatable = true;
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
     *
     * @method collection
     *
     * Gets a collection, with is a
     * list of pages, and some other stuff
     * to operate on
     *
     * @param {string[]} path: path that you desire to get a reference to
     * @returns {FirebaseCollection}: the collection ye wished for
     *
     */
    
    collection(...target:string[]): Collection {
        let top:string[] = this.isWorkspace ? ["workspaces", this.ticketID] : ["users", this.ticketID];
        return this.rm.collection(top.concat(target));
    }

    /**
     *
     * @method page
     *
     * Gets a Page to operate on
     *
     * @param {string[]} path: path that you desire to get a reference to
     * @returns {Page}: the page ye wished for
     *
     */

    page(...target:string[]):  Page {
        let top:string[] = this.isWorkspace ? ["workspaces", this.ticketID] : ["users", this.ticketID];
        return this.rm.page(top.concat(target));
    }
}



