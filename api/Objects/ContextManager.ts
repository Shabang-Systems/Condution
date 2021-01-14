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

interface CollectionOperator {
    get: Function,
    add: Function,
    delete: Function,
}

interface DocumentOperator {
    get: Function,
    set: Function,
    update: Function,
    delete: Function,
}

export default class ContextManager {
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
    
    private rRef(target:string[]): Page {
        let top:string[] = this.isWorkspace ? ["workspaces", this.ticketID] : ["users", this.ticketID];
        return this.rm.reference(top.concat(target), true);
    }

    private async collectionGet(target:string[]): Promise<object[]> {
	return (await (this.rRef(target).get())).docs.map((d:any)=>Object.assign(d.data(),{id:d.id}));
    }

    private async collectionAdd(target:string[], payload:object): Promise<object> {
	let newID:string = (await (this.rRef(target).add(payload))).id;
	return this.documentGet([...target, newID]);
    }

    private async documentGet(target:string[]): Promise<object> {
	let result:any = (await (this.rRef(target).get()));
	return Object.assign(result.data(),{id:result.id});
    }

    collection(...target:string[]): CollectionOperator {
	return {
	    get: async ()=>(await this.collectionGet(target)),
	    add: async (payload: object)=>(await this.collectionAdd(target, payload)),
	    delete: async ()=>{}
	}
    }

    get couldAuthenticate():boolean {
	return this.authenticatable;
    }
}

