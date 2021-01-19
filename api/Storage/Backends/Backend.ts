/* 
 * 
 * Buenas Dias Human
 * I am Backend.ts.
 *
 * A file that defines what the pernickty backend
 * of Condution takes as a Storage provider.
 * 
 * All storage providers should inherit from the 
 * Provider abstract class. They at least need to provide
 * the refrence function that returns an instance of Page.
 *
 * Imagine that this is Poetry.
 *
 *
 * @jemoka
 *
 */

interface AuthenticationResult {
    actionDesired: string,
    actionSuccess: boolean,
    identifier: string,
    payload?: any
}

interface AuthenticationRequest {
    requestType?: string,
    identifier?: string,
    payload?: any
}

interface AuthenticationUser {
    identifier: string,
    displayName: string,
    email: string
}

interface DataExchangeResult {
    identifier: string,
    payload: object,
    response: any
}

abstract class AuthenticationProvider {
    protected _authenticated : boolean;

    abstract get currentUser() : AuthenticationUser;

    get authenticated() : boolean {
        return this._authenticated;
    }

    abstract authenticate(request: AuthenticationRequest) : Promise<AuthenticationResult>;
    abstract deauthenticate() : void;

    abstract createUser(request: AuthenticationRequest) : Promise<AuthenticationResult>;
    abstract updateUserProfile(request: AuthenticationRequest) : Promise<AuthenticationResult>;
}

/**
 *
 * @Class Provider
 * 
 * A backend provider that is used by the engine to get and manage data
 * 
 * Example:
 *
 * > let provider = new Provider();
 * > let taskRef = provide.reference("users", "test", "tasks", "434d5fab10129a");
 *
 */

abstract class Provider {
    abstract name: string;

    /**
     * 
     * @protected @property _authSupported
     * 
     * Marks if database provider supports 
     * authentication and hence the related features
     * a la Workspaces and whatever
     * 
     */

    protected _authSupported: boolean;

    /**
     * 
     * @property authSupported
     * 
     * Returns the private _authSupported prop
     * 
     */

    get authSupported(): boolean {
        return this._authSupported;
    }
    
    /**
     * 
     * @method page
     *
     * Gets a Page to operate on 
     *
     * @param {string[]} path: path that you desire to get a reference to
     * @param {Function} refreshCallback: the callback to update when data gets refreshed
     * @returns {Page}
     *
     */

    abstract page(path: string[], refreshCallback?:Function) : Page;

    /**
     *
     * @method collection
     *
     * Gets a collection, with is a
     * list of pages, and some other stuff
     * to operate on
     *
     * @param {string[]} path
     * @returns {Collection}
     *
     */
    
    abstract collection(path: string[]) : Collection;

    /**
     *
     * @property authenticationProvider
     *
     * Return the AuthenticationProvider instance bundled with the Provider, 
     * if that is supposed to be a thing
     *
     */
    
    get authenticationProvider() : AuthenticationProvider {
        console.log("CondutionEngine: attempting to acquire the auth provider on a backend with authenticationProvider() unimplemented!");
        return null;
    }

    /**
     * @method flush
     *
     * Used during log out and wipes. Do whatever to clean up after yourself.
     *
     * @returns {void}
     */

    abstract flush() : void;
}


/**
 *
 * @Class Page
 * 
 * A single page of a document
 * You probably know it as what a Provider page()
 * returns.
 *
 * All functions does a particular action on the page
 * 
 * Example:
 *
 * > let provider = new Provider()
 * > let page = provider.page("users", "test", "tasks", "434d5fab10129a")
 * > page.set({"name": "A Task!"})
 *
 */

abstract class Page {
    abstract get id() : string; // The ID of the Page

    abstract get() : Promise<object>; // Function to get the value of page
    abstract set(payload:object, ...param:any) : Promise<DataExchangeResult> ; // Function to set a value of a page
    abstract update(payload:object) : Promise<DataExchangeResult> ; // Function to update the value of a page
    abstract delete() : Promise<DataExchangeResult> ; // Function to delete a page
}



/**
 *
 * @Class Collection
 * 
 * A bunch of Pages.
 * You probably know it as what a Provider collection()
 * returns.
 *
 * All functions does a particular action on the page
 * 
 * Example:
 *
 * > let provider = new Provider()
 * > let collection = provider.collection("users", "test", "tasks")
 * > collection.add({"name": "A Task!"})
 *
 */

abstract class Collection {
    abstract pages(): Promise<Page[]>; // the... contents, but in pages form
    abstract data(): Promise<object[]>; // the... contents
    abstract add(payload:object) : Promise<DataExchangeResult>; // Function to send a value to the page
    abstract delete() : Promise<DataExchangeResult> ; // Function to delete a page
}

export { Provider, Page, AuthenticationProvider, Collection };
export type { AuthenticationRequest, AuthenticationResult, AuthenticationUser, DataExchangeResult };

