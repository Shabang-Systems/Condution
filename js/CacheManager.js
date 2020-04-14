"use strict";

require("firebase/auth");   // TODO: dunno where to put this so that app.js doesn't error
require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDFv40o-MFNy4eVfQzLtPG-ATkBUOHPaSI",
    authDomain: "condution-7133f.firebaseapp.com",
    databaseURL: "https://condution-7133f.firebaseio.com",
    projectId: "condution-7133f",
    storageBucket: "condution-7133f.appspot.com",
    messagingSenderId: "544684450810",
    appId: "1:544684450810:web:9b1caf7ed9285890fa3a43"
};

// Initialize Firebase Application
firebase.initializeApp(firebaseConfig);

const initFirebase = () => {
    // Firebase App (the core Firebase SDK) is always required and
    // must be listed before other Firebase SDKs
    //const firebase = require("firebase/app");

    require("firebase/auth");
    require("firebase/firestore");

    const firebaseConfig = {
        apiKey: "AIzaSyDFv40o-MFNy4eVfQzLtPG-ATkBUOHPaSI",
        authDomain: "condution-7133f.firebaseapp.com",
        databaseURL: "https://condution-7133f.firebaseio.com",
        projectId: "condution-7133f",
        storageBucket: "condution-7133f.appspot.com",
        messagingSenderId: "544684450810",
        appId: "1:544684450810:web:9b1caf7ed9285890fa3a43"
    };

    // Initialize Firebase Application
    firebase.initializeApp(firebaseConfig);

    return firebase.firestore();
}


const { refGenerator: dbRef } = (() => {
    const firebaseDB = initFirebase();
    const cache = new Map();

    function convertPath(_path) {
        /*
         * @deprecated
         */

        if (_path instanceof Map)
            return _path;   // TODO: more validation
        else if (typeof _path === 'object')
            return new Map(Array.from(path));
    }

    function getHandler(path) { // TODO; mimic functionality for set, update, delete, add; remember to bind this!
        if (cache.has(path))
            return cache.get(path);
        else {
            cache.set(path, /* TODO: write dbGetReference, should do same as dbRef */ );
        }
    }

    function refGenerator(path) {
        /*
         * Get a database reference.
         *
         * @param   path        A valid path array, see below.
         * @return  reference   The generated reference
         *
         * Examples of valid path arrays:
         *  ["collection", "docName"] => DocumentReference
         *  ["collection", "docName", "collection"] => CollectionReference
         *  ["collection", ["query", "params"], ["more", "params"]] => Query
         *  ["collection", ["query", "params"], "docname"] => DocumentReference
         */
        let ref = db;
        let stringIsCollection = true;
        for (let nav of path) {
            if (typeof nav === 'string') {
                if (ref instanceof DocumentReference) {
                    ref = ref.collection(nav);
                } else if (ref instanceof Query) {
                    ref = ref.doc(nav);
                }
            } else if (Array.isArray(nav)) {                // query
                console.assert(ref instanceof Query)
                ref = ref.where(...nav);
            }
        }
        return ref;
    }

    return {
        refGenerator: (_path) => {
            const path = convertPath(_path);

        }

    function cacheRef(path) {
        /* TODO
         * Get a reference wrapper that forces cache hits.
         * This function will be exposed to the outside world.
         *
         * @param   path    A valid path array.
         * @return  wrapper A wrapper object around the expected reference.
         */
    }

    return {
        dbRef: cacheRef
    }
})();

var quickDirtyCacheByIdsWithCollisionsTODO = {};
const quickDirtyGetLastKeyOfDictTODO = (dict) => {
    Object.values(dict)[Object.values(dict).length-1]
};

async function _cacheDump() {
    // TODO: implement actually good caching, write to the cache instead of dumping on write to database
    quickDirtyCacheByIdsWithCollisionsTODO = {};
};

// NOTE: not async to remove the need to await/then it
function dbRef(path) {
    // TODO: refactor for query caching
    let ref = db;
    for (let [key, val] of Object.entries(path)) {
        ref = ref.collection(key);
        if (typeof val === 'string') // get doc
            ref = ref.doc(val);
        else if (Array.isArray(val)) // where clause: use like {task: ['project', '==', '']}
            ref = val.reduce((ref, q) => ref.where(...q), ref); // TODO: this line untested
        else if (typeof val === 'undefined') // wildcard: use like {user: userID, project: undefined}
            break;
    }
    return {    // NOTE: wrapped in promise.resolve
        get: ref.get.bind(ref),
        set: (data, options) => { _cacheDump(); return ref.set.bind(ref)(data, options); },
        add: (data) => { _cacheDump(); return ref.add.bind(ref)(data); },
        delete: () => { _cacheDump(); return ref.delete.bind(ref)(); },
        update: (data) => { _cacheDump(); return ref.update.bind(ref)(data); }
    };
};

async function dbGet(path, debug=false) {
    // TODO: query caching
    // NOTE: not awaited because this is an async function, should be awaited outside of it
    const finalKey = quickDirtyGetLastKeyOfDictTODO(path);              //  get the final key
    if (debug) console.log(finalKey); // TODO: remove debug things
    if (typeof finalKey === 'string') {                                 //  it's (probably) a id
            console.log('string aka doc');
        if (quickDirtyCacheByIdsWithCollisionsTODO.hasOwnProperty(finalKey)) {   //  and the cache has it
            return quickDirtyCacheByIdsWithCollisionsTODO[path];        //  return from cache
        } else {                                                        //  doesn't exist in the cache yet
            const snap = await dbRef(path).get();                       //  get snapshot from db
            quickDirtyCacheByIdsWithCollisionsTODO[finalKey] = snap;    //  save snapshot to cache
            console.log(snap);
            return snap;                                                //  and return the new data
        }
    } else {                                                            //  TODO: query, too hard to cache, implement query caching
        return (await dbRef(path)).get();                               //  do a database hit
    }
};

