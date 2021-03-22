import  { Provider, Page, Collection } from "./Backend";
import type {  DataExchangeResult } from "./Backend";

var fs = require('fs');
var path = require('path');


// TODO TODO the maps should go to somewhere better than this.
let unsubscribeCallbacks = new Map();

/**
 * A firebase collection to operate on 
 * 
 * Storage/Backend/Backend/Page/Collection abstract 
 * class for usage and documentation.
 *
 * @extends {Collection}
 * 
 */

class JSONCollection extends Collection {
    path: string[];
    
    private commit: Function;
    private load: Function;
    private database: object;
    
    constructor(path:string[], loadfunc:Function, commitfunc:Function) {
        super();

        this.database = loadfunc();
        this.load = loadfunc;
        this.commit = commitfunc;
        this.path = path;
    }

    private clean(obj:object) {
        for (var propName in obj) {
            if (obj[propName] === null || obj[propName] === undefined) {
                delete obj[propName];
            }
        }
        return obj
    }


    async add(payload:object) {
        let path = [...this.path];
        let pointer = this.database;

        path.forEach(i => {
            if(!pointer[i]) pointer[i] = {};
            pointer = pointer[i];
        });
        let id = this.generateRandomString();
        while (pointer[id]) id = this.generateRandomString();
        for (const key in payload) {
            if (payload[key] instanceof Date) {
                payload[key] = {seconds: Math.round(payload[key].getTime()/1000)-5} // The function runs a bit too quickly. Bump time forward by 5 ms.
            }
        }
        pointer[id] = this.clean(payload);

        this.commit(this.database);

        return {identifier: id, payload: payload, response: payload};
    }

    
    async delete() {
        let path = [...this.path];
        let task = path.pop();
        let pointer = this.database;
        path.forEach(i => {
            if(!pointer[i]) pointer[i] = {};
            pointer = pointer[i];
        });

        delete pointer[task];
        this.commit(this.database);

        return {identifier: null, payload: null, response: pointer};
    }

    async pages() {
        let path = [...this.path];
        let task = path.pop();
        let pointer = this.database;
        path.forEach(i => {
            if(!pointer[i]) pointer[i] = {};
            pointer = pointer[i];
        });
        let resultDocuments: JSONPage[] = [];
        for (let key in pointer[task]) {
            resultDocuments.push(new JSONPage([...this.path, key], this.load, this.commit));
        }
        return resultDocuments;
    }

    async data() {
        let path = [...this.path];
        let task = path.pop();
        let pointer = this.database;
        path.forEach(i => {
            if(!pointer[i]) pointer[i] = {};
            pointer = pointer[i];
        });
        let resultDocuments: object[] = [];
        for (let key in pointer[task]) {
            resultDocuments.push(Object.assign(pointer[task][key], {id: key}));
        }
        return resultDocuments;
    }


    /**
     * Generates a random string. Used for Ids.
     * @private
     *
     * THIS IS NOT CRYPTOGRAPHICALLY SECURE
     * But we are pretty sure it won't collide
     *
     * @returns{string}  The random string
     *
     */

    private generateRandomString() : string {
        return Math.random().toString(36).substring(2)+Math.random().toString(36).substring(2)+Math.random().toString(36).substring(2);
    }

}


/**
 * A JSON page to operate on see 
 * 
 * Storage/Backend/Backend/Page abstract 
 * class for usage and documentation.
 *
 * @extends {Page}
 * 
 */


class JSONPage extends Page {
    path: string[];
    
    private commit: Function;
    private refresh: Function;
    private database: object;
    private data: Promise<object>; 
    
    constructor(path:string[], loadfunc:Function, commitfunc:Function, refreshCallback:Function=()=>{}) {
        super();

        this.database = loadfunc();
        this.commit = commitfunc;
        this.refresh = refreshCallback;
        this.path = path.length <= 2 ? [...path, "$docdata"] : path;

        this.refreshDataAndCallback();
    }

    private refreshDataAndCallback() {
        this.data = (async () : Promise<object> => {
            let pointer = this.database;
            this.path.forEach(i => {
                pointer = pointer[i];
            });

            let finalData:object = Object.assign(pointer?pointer:{}, {id:this.path[this.path.length-1]});
            this.refresh(finalData);
            return finalData;
        })();
    }

    async set(payload:object, ...param:any):Promise<DataExchangeResult> {
        let path = [...this.path];
        let task = path.pop();
        let pointer = this.database;
        path.forEach(i => {
            if(!pointer[i]) pointer[i] = {};
            pointer = pointer[i];
        });
        for (const key in payload) {
            if (payload[key] instanceof Date) {
                payload[key] = {seconds: Math.round(payload[key].getTime()/1000)-5} // The function runs a bit too quickly. Bump time forward by 5 ms.
            }
        }
        if (param[0] && param[0].merge)
            pointer[task] = Object.assign(pointer[task], payload);
        else
            pointer[task] = payload;

        this.commit(this.database);
        this.refreshDataAndCallback();

        return {identifier: this.id, payload: payload, response: pointer};
    }

    async update(payload:object) {
        let path = [...this.path];
        let task = path.pop();
        let pointer = this.database;
        path.forEach(i => {
            if(!pointer[i]) pointer[i] = {};
            pointer = pointer[i];
        });
        for (const key in payload) {
            if (payload[key] instanceof Date) {
                payload[key] = {seconds: Math.round(payload[key].getTime()/1000)-5} // The function runs a bit too quickly. Bump time forward by 5 ms.
            }
        }

        pointer[task] = Object.assign(pointer[task], payload);
        this.commit(this.database);
        this.refreshDataAndCallback();

        return {identifier: this.id, payload: payload, response: pointer};
    }

    async delete() {
        let path = [...this.path];
        let task = path.pop();
        let pointer = this.database;
        path.forEach(i => {
            if(!pointer[i]) pointer[i] = {};
            pointer = pointer[i];
        });

        delete pointer[task];
        this.commit(this.database);
        this.refreshDataAndCallback();

        return {identifier: null, payload: null, response: pointer};
    }

    get id() : string {
        return this.path[this.path.length-1]; // return the requested ID
    }

    async get() : Promise<object> {
        return await this.data;
    }
}

/**
 * A backend provider that provides for Condution connection to a JSON file
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

class JSONProvider extends Provider {
    name: string;
    private filePath: string;
    private relDir: string;
    private data: object;

    constructor(filePath:string, name:string="json", dirRelativeTo:string=__dirname) {
        super();

        // set our paths
        this.name = name;
        this.filePath = filePath;
        this.relDir = dirRelativeTo;

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
     * @returns {FirebaseCollection}: the collection ye wished for
     *
     */

    collection(path: string[]) :  Collection {
        return new JSONCollection(path, this.load, this.commit);
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
        return fs.writeFileSync(path.join(this.relDir, this.filePath), JSON.stringify(data), (_: any) => { });
    }

    /**
     * Load data from file
     *
     * @returns {object}
     *
     */
     
    load = (): object => {
        this.data = JSON.parse(fs.readFileSync(path.join(this.relDir, this.filePath),{ encoding: 'utf8' }));
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

export default JSONProvider;
export {JSONCollection, JSONPage};

