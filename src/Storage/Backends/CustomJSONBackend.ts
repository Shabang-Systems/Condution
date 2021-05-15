import  { Provider, Page, Collection } from "./Backend";
import  { JSONCollection, JSONPage } from "./JSONBackend";
import type {  DataExchangeResult } from "./Backend";

/**
 * A backend provider that provides for Condution connection to a JSON thing
 * You get to decide where the heck the thing goes to! So you figure out
 * how to save the JSON. I don't care... I coulden't care less!
 *
 *
 * Example:
 *
 * > let provider = new Provider();
 * > let taskRef = provide.reference("Users", "test", "tasks");
 *
 * @extends {Provider}
 *
 */

class CustomJSONProvider extends Provider {
    name: string;

    private defaultUser: string;
    private loadFunc: Function;
    private commitFunc: Function;
    private data: object;

    constructor(name:string="json", loadFunc:Function, commitFunc:Function) {
        super();

        // set our paths
        this.name = name;
        
        // set our functions
        this.loadFunc = loadFunc;
        this.commitFunc = commitFunc;

        // No, we don't support auth
        this._authSupported = false;

        // Fetch data
        this.load();
    }

    /**
     * Gets a Page to operate on
     *
     * @param {string[]} path: path that you desire to get a reference to
     * @param {Function} refreshCallback: the callback to update when data gets refreshed
     * @returns {Page}: the page ye wished for
     *
     */

    page(path: string[], refreshCallback?:Function) : Page {
        return new JSONPage(path, this.load, this.commit, refreshCallback);
    }

    /**
     * Gets a collection
     * get a list of pages, and some other stuff
     * to operate on
     *
     * @param {string[]} path: path that you desire to get a reference to
     * @param {Function} refreshCallback: the callback to update when data gets refreshed
     * @returns {FirebaseCollection}: the collection ye wished for
     *
     */

    collection(path: string[], refreshCallback?:Function) :  Collection {
        return new JSONCollection(path, this.load, this.commit, refreshCallback);
    }

    /**
     * Commit data to file
     *
     * @param {object} data    the data you want to commit to file
     * @returns {void}
     *
     */
     
    commit = (data:object) : void => {
        this.data = data;
        return this.commitFunc(data);
    }

    /**
     * Load data from file
     *
     * @returns {object}
     *
     */
     
    load = (): object => {
        this.data = this.loadFunc();
        if (Object.keys(this.data).length === 0 && this.data.constructor === Object)  {
            this.data = {users: {}, workspaces: {}, invitations:{}};
            this.data["users"][this.defaultUser] = {};
        }
        this.commit(this.data);
        return this.data;
    }


    /**
     * The Authentication Providerj
     * @property
     *
     * Return the AuthenticationProvider instance bundled with the Provider, 
     * if that is supposed to be a thing
     *
     */

    get authenticationProvider() {
        return null;
    }
   
    /**
     * Nuke the cache
     * 
     * Used for logging out and general cleanup
     *
     */

    flush() {
        // do nothing.
    }
}

export default CustomJSONProvider;
export {JSONCollection, JSONPage};

