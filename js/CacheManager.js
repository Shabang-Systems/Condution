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

const db = firebase.firestore();

const initFirebase = () => {
    // Firebase App (the core Firebase SDK) is always required and
    // must be listed before other Firebase SDKs
    // const firebase = require("firebase/app");

    return [firebase.firestore(), firebase.firestore];
}

const { refGenerator: cRef } = (() => {
    const [ firebaseDB, fsRef ] = initFirebase();
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
                }
            } else if (Array.isArray(nav)) {                // query
                console.assert(ref instanceof fsRef.Query)
                ref = ref.where(...nav);
            }
        }
        return ref;
    }

    const handlers = {
        get: async (path) => { // TODO; mimic functionality for set, update, delete, add; remember to bind this!
            const TODOstrung = JSON.stringify(path);
            if (!cache.has(TODOstrung)) {
                const ref = getFirebaseRef(path);
                cache.set(TODOstrung, ref.get());   // TODO: needed?
                unsubscribeCallbacks.set(TODOstrung, ref.onSnapshot({
                    error: console.trace,
                    next: (snap) => {
                        cache.set(TODOstrung, snap);
                    }
                }));
            }
            return cache.get(TODOstrung);
        }
    };

    function cacheRef(path) {
        /* TODO
         * Get a reference wrapper that forces cache hits.
         * This function will be exposed to the outside world.
         *
         * @param   path    A valid path array.
         * @return  wrapper A wrapper object around the expected reference.
         */
        return {
            get: () => handlers.get(path),
            set: getFirebaseRef(path).set,
            add: getFirebaseRef(path).add,
            delete: getFirebaseRef(path).delete,
            update: getFirebaseRef(path).update
        };
    }

    return {
        refGenerator: cacheRef
    }
})();

