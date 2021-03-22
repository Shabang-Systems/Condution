import  { Provider, Page, Collection, AuthenticationProvider } from "./Backend";
import type { AuthenticationResult, AuthenticationRequest, AuthenticationUser, DataExchangeResult } from "./Backend";

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
    private db: object;

    constructor(path:string[], data:object) {
        super();
        this.path = path;
        this.db = data;
    }

    async add(payload:object) {
        //const ref = this.getFirebaseRef(this.path);           //  get the reference from the database
        //const resultDocument = await ref.add(payload); // add the document
        //return {identifier: resultDocument.id, payload: payload, response: resultDocument};
        return null;
    }

}

    //async delete() {
        //const ref = this.getFirebaseRef(this.path);           //  get the reference from the database
        //const resultDocument = await ref.delete(); // delete the document
        //return {identifier: null, payload: null, response: resultDocument};
    //}

    /**
     * Gets a page array from the database.
     *
     * @param   path - The valid path to the reference
     * @returns {Page[]} - The result of calling `.get()` on the database reference
     *
     */

    //async pages() : Promise<Page[]> {
        //return (await this.getFirebaseRef(this.path).get()).docs.map((page:any)=>{
            //return new FirebasePage([...this.path, page.id], this.firebaseDB, this.firebaseRef);
        //});
    //}

    /**
     * Gets a data snapshot from the database.
     *
     * @param   path    The valid path to the reference
     * @returns  {object[]} The result of calling `.get()` on the database reference
     *
     */

    //async data() : Promise<object[]> {
        //return (await this.getFirebaseRef(this.path).get()).docs.map((page:any)=>{
            //return Object.assign(page.data(), {id: page.id});
        //});
    //}




    /**
     * Get a database reference.
     *
     * @param   path        A valid path array, see below.
     * @returns reference   The generated reference
     *
     * Examples of valid path arrays:
     *  [`collection/${docName}`] => DocumentReference
     *  ["collection", "docName"] => DocumentReference
     *  ["collection", "docName", "collection"] => CollectionReference
     *  ["collection", ["query", "params"], ["more", "params"]] => Query
     *  ["collection", ["query", "params"], "docname"] => DocumentReference
     * 
     */

    //getFirebaseRef(path:string[]) {
        //let ref:any = this.firebaseDB;
        //let fsRef:any = this.firebaseRef;

        //// special handling for first collection from root
        //console.assert(typeof path[0] === 'string');
        //if (path[0].includes('/'))
            //ref = ref.collectionGroup(path[0]);
        //else
            //ref = ref.collection(path[0]);
        //// generic handling
        //for (let n of path.slice(1)) {
            //let nav:any = n;
            //if (typeof nav === 'string') {
                //if (ref instanceof fsRef.DocumentReference) {
                    //ref = ref.collection(nav);
                //} else if (ref instanceof fsRef.Query) {
                    //ref = ref.doc(nav);
                //} else {
                    //throw new Error("Unknown reference");
                //}
            //} else if (Array.isArray(nav)) {                // query, TODO shouldn't need to query
                //if (ref instanceof fsRef.Query) {
                    //ref = ref.where(...nav);
                //} else {
                    //throw new Error("Cannot query with");
                //}
                //console.assert(ref instanceof fsRef.Query)
            //} else {
                //throw new Error("Cannot parse");
            //}
        //}
        //return ref;
    //}
//}

/**
 * A firebase page to operate on see 
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

            let finalData:object = Object.assign({id:path[path.length-1]}, pointer);
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


    //async delete() {
        //const ref = this.getFirebaseRef(this.path);           //  get the reference from the database
        //const resultDocument = await ref.delete(); // delete the document
        //return {identifier: null, payload: null, response: resultDocument};
    //}

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
        return null;
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
        return fs.writeFile(path.join(this.relDir, this.filePath), JSON.stringify(data), (err: any) => {
            console.log(err);
        });
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

