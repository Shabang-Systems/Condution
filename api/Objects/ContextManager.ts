import ReferenceManager from "../Storage/ReferenceManager";
import { Page, Provider } from "../Storage/Backends/Backend"; 

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

export default class ContextManager {
    private rm:ReferenceManager; // the ReferenceManager used by this context
    private ticketID:string; // current UID/Workspace ID
    private isWorkspace:boolean = false; // currently under workspaces mode
    private authenticated:boolean = false; // are we currently authenticated?

    constructor(refManager:ReferenceManager, initializeWithoutAuth:boolean=false) {
        this.rm = refManager;
        
        if (!initializeWithoutAuth && this.rm.currentProvider.authSupported) {
            console.assert(this.rm.currentProvider.authenticationProvider.authenticated, "CondutionEngine: requested context initialization with auth but provider not authenticated.");
            this.ticketID = this.rm.currentProvider.authenticationProvider.currentUser.identifier;
            this.authenticated = true;
        }
    }
    
    rRef(...target:string[]): Page {
        let top:string[] = this.isWorkspace ? ["workspaces", this.ticketID] : ["users", this.ticketID];
        return this.rm.reference(...(top.concat(target)));
    }
}

