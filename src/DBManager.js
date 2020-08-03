//"use strict";

// Initialize Firebase Application
// TODO TODO TODO !!!! Change this on deploy

let storageType;
let sqliteDB;
let memoryDB;
let firebaseDB, fsRef;

const initStorage = (fbPointer, stoType) => {
    // Firebase App (the core Firebase SDK) is always required and
    // must be listed before other Firebase SDKs
    // const firebase = require("firebase/app");

    storageType = stoType;
    if (storageType === "firebase") {
        const obj = require("./../secrets.json");
        fbPointer.initializeApp(obj.dbkeys.debug);
        [ firebaseDB, fsRef ] = [fbPointer.firestore(), fbPointer.firestore];
        firebaseDB.enablePersistence({synchronizeTabs: true}).catch(console.error);
        return new Promise(function(resolve) {
            return resolve(fsRef);
        });
    } else if (storageType === "sqlite") {
        const sqlite3 = require('sqlite3').verbose();   // see https://www.sqlitetutorial.net/sqlite-nodejs/connect/
        const { FilesystemDirectory, Plugins } = require('@capacitor/core');
        const { Device } = Plugins;
        console.error("algobert come to the rescue!");
        return (async function() {
            const isMobile = (await Device.getInfo()).platform !== "web";
            const dbRoot = isMobile ? FilesystemDirectory.Data : process.resourcesPath;
            const dbPath = '/condution.db'; // TODO: use capacitor storage api
            sqliteDB = new sqlite3.Database(dbRoot+dbPath, (e)=>{if(e) console.error(e)});
            return sqliteDB;
        })();
    } else if (storageType === "json") {
        const { FilesystemDirectory, FilesystemEncoding, Plugins } = require('@capacitor/core');
        const { Device, Filesystem } = Plugins;
        return (async function() {
            const dbRoot = FilesystemDirectory.Data;
            const dbPath = 'condution.json'; // TODO: use capacitor storage api
            try {
                contents = (await Filesystem.readFile({
                    path: dbPath,
                    directory: dbRoot,
                    encoding: FilesystemEncoding.UTF8
                })).data;
            } catch(e) {
                contents = "{}";
                await Filesystem.writeFile({
                    path: dbPath,
                    directory: dbRoot,
                    data: JSON.stringify({}),
                    encoding: FilesystemEncoding.UTF8
                })
            }
            memoryDB = JSON.parse(contents);
        })();
    }
};

const [cRef, flush] = (() => {
    //const { Plugins } = require('@capacitor/core');
    //const { Network } = Plugins;

    let cache = new Map();
    let unsubscribeCallbacks = new Map();

    function flush() {
        /*
         * Nukes the cache
         *
         * Used to log people out
         *
         * @return none
         *
         */
        cache = new Map();
        unsubscribeCallbacks = new Map();
    }

    function getFirebaseRef(path) {
        /*
         * Get a database reference.
         *
         * @param   path        A valid path array, see below.
         * @return  reference   The generated reference
         *
         * Examples of valid path arrays:
         *  [`collection/${docName}`] => DocumentReference
         *  ["collection", "docName"] => DocumentReference
         *  ["collection", "docName", "collection"] => CollectionReference
         *  ["collection", ["query", "params"], ["more", "params"]] => Query
         *  ["collection", ["query", "params"], "docname"] => DocumentReference
         */
        let ref = firebaseDB;
        // special handling for first collection from root
        console.assert(typeof path[0] === 'string');
        if (path[0].includes('/'))
            ref = ref.collectionGroup(path[0]);
        else
            ref = ref.collection(path[0]);
        // generic handling
        for (let nav of path.slice(1)) {
            if (typeof nav === 'string') {
                if (ref instanceof fsRef.DocumentReference) {
                    ref = ref.collection(nav);
                } else if (ref instanceof fsRef.Query) {
                    ref = ref.doc(nav);
                } else {
                    throw new Error("Unknown reference", ref.toString());
                }
            } else if (Array.isArray(nav)) {                // query, TODO shouldn't need to query
                if (ref instanceof fsRef.Query) {
                    ref = ref.where(...nav);
                } else {
                    throw new Error("Cannot query with", nav.toString());
                }
                console.assert(ref instanceof fsRef.Query)
            } else {
                throw new Error("Cannot parse", nav.toString());
            }
        }
        return ref;
    }

    async function cachedRead(path) {   // TODO: make this also use hard storage, dupe for cachedSet
        /*
         * Get a snapshot from the cache.
         *
         * @param   path    The valid path to the reference
         * @return  any     The result of calling `.get()` on the database reference
         *
         * Logic:
         *  If the path is cached, return from cache.
         *  Else, register a snapshot listener to update the cache
         *      and return the newly cached value.
         */
        const TODOstring = JSON.stringify(path);        //  strigify to hash array
        if (!cache.has(TODOstring)) {                   //  if path string isn't cached
            // TODO: comment this out someday \/
            const ref = getFirebaseRef(path);           //  get the reference from the database
            cache.set(TODOstring, ref.get());           //  save result in cache
            unsubscribeCallbacks.set(TODOstring,        //  TODO: comment this code, someday
                ref.onSnapshot({
                    error: console.trace,
                    next: (snap) => {
                        cache.set(TODOstring, snap);
                    }
                })
            );
        }
        return await cache.get(TODOstring);
    }

    async function storageRead(path) { 
        /*
         * Read value in storage
         *
         * @param   path    The path to a reference
         * @return  DocumentSnapshot    A snapshot of documents
         *
         */
        let pointer = memoryDB;
        path.some(i => {
            pointer = pointer[i];
            return (pointer === undefined); // https://stackoverflow.com/questions/2641347/short-circuit-array-foreach-like-calling-break
        });
        return pointer ? {docs: pointer} : undefined;
    }

    //async function storageSet(path, value) {
        /*
         * Set a value in the storage.
         *
         * @param   path    The valid path to reference
         * @param   value   The value to set it to
         * @return  none
         */
    //    const TODOstring = JSON.stringify(path);    // stringify array, please change someday
    //    // update storage
    //    if (decideWhetherToUseHardStorage())
    //
    //    // maintain the cache
    //    if (!cache.has(TODOstring)) {
    //        cache.set();
    //    }
    //    const ref = getFirebaseRef(path);
    //    ref.set(value);
    //    cache.set(stringPath, value)
    //}

    function cacheRef(...path) {
        /*
         * Get a reference wrapper that forces cache hits.
         * This function will be exposed to the outside world.
         *
         * @param   path    A valid path array.
         * @return  wrapper A wrapper object around the expected reference.
         */
        //console.log(getFirebaseRef(path));
        return Object.assign(
            getFirebaseRef(path),               //  default methods from firebase reference
            { get: () => cachedRead(path) }     //  read on get, read from cache if available
        );
    }
    function TODO() { console.error('bad news bears'); }
    function storageRef(...path) {
        /*
         * Get a reference wrapper that acts as a database blackbox.
         *
         * @param   path    A valid path array.
         * @return  wrapper A wrapper object around the expected reference.
         */
        //console.log(ref.add, ref.doc, ref.docs);
        return {
            id: TODO,
            add: TODO,
            doc: TODO,
            docs: TODO, // TODO: docs.filter
            get: () => storageRead(path),
            set: TODO,
            update: TODO
        };
    }

    if (storageType) { // TODO: how to get bool out of promise???
        return [cacheRef, flush];
    } else { console.log('using hard storage');
        return [storageRef, flush];
    }
})();

module.exports = {__init__:initStorage, cRef, flush};

