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
     * @method reference
     *
     * Gets a Page to operate on 
     *
     * @param {string[]} path
     * @returns {Page}
     */

    abstract reference(path: string[]) : Page;
    
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
 * You probably know it as what a Provider refrence()
 * returns.
 *
 * All functions does a particular action on the page
 * 
 * Example:
 *
 * > let provider = new Provider()
 * > let page = provider.refrence("users", "test", "tasks", "434d5fab10129a")
 * > page.set({"name": "A Task!"})
 *
 */

abstract class Page {
    abstract get id() : string; // The ID of the Page

    abstract get() : Promise<object>; // Function to get the value of page
    abstract add(payload:object) : Promise<object>; // Function to send a value to the page
    abstract set(payload:object, ...param:any) : Promise<object> ; // Function to set a value of a page
    abstract update(payload:object) : Promise<object> ; // Function to update the value of a page
    abstract delete() : Promise<object> ; // Function to delete a page
}

export { Provider, Page, AuthenticationProvider };
export type { AuthenticationRequest, AuthenticationResult, AuthenticationUser };

