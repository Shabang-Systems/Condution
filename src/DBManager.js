//"use strict";

// Initialize Firebase Application
// TODO TODO TODO !!!! Change this on deploy

let firebaseDB, fsRef;

const initFirebase = (fbPointer) => {
    // Firebase App (the core Firebase SDK) is always required and
    // must be listed before other Firebase SDKs
    // const firebase = require("firebase/app");

    const obj = require("./../secrets.json")
    fbPointer.initializeApp(obj.dbkeys.debug);
    [ firebaseDB, fsRef ] = [fbPointer.firestore(), fbPointer.firestore];
}

const cRef = (() => {
    const cache = new Map();            // TODO: ['a'] != ['a'], so this doesn't work
    const unsubscribeCallbacks = new Map();

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
            } else if (Array.isArray(nav)) {                // query
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

    async function cachedRead(path) {
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

    function cacheRef(...path) {
        /*
         * Get a reference wrapper that forces cache hits.
         * This function will be exposed to the outside world.
         *
         * @param   path    A valid path array.
         * @return  wrapper A wrapper object around the expected reference.
         */
        return Object.assign(
            getFirebaseRef(path),               //  default methods from firebase reference
            { get: () => cachedRead(path) }     //  read on get, read from cache if available
        );
    }

    return cacheRef;
})();

module.exports = {__init__:initFirebase, cRef};

