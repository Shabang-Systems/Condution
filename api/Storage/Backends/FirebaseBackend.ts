import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import  { Provider, Page, AuthenticationProvider } from "./Backend";
import type { AuthenticationResult, AuthenticationRequest, AuthenticationUser } from "./Backend";

// TODO TODO the maps should go to somewhere better than this.
let cache = new Map();
let unsubscribeCallbacks = new Map();

/**
 * FirebasePage
 *
 * A firebase page to operate on see 
 * Storage/Backend/Backend/Page abstract 
 * class for usage and documentation.
 *
 * @extends {Page}
 * 
 */


class FirebasePage extends Page {
    path: string[];
    firebaseDB: firebase.firestore.Firestore;
    firebaseRef: typeof firebase.firestore;

    constructor(path:string[], firebaseDB:firebase.firestore.Firestore, firebaseRef:(typeof firebase.firestore)) {
        super();
        this.path = path;
        this.firebaseDB = firebaseDB;
        this.firebaseRef = firebaseRef;
    }

    get id() : string {
        const ref = this.getFirebaseRef(this.path);           //  get the reference from the database
        return ref.id; // return the requested ID
    }

    async add(payload:object) {
        const ref = this.getFirebaseRef(this.path);           //  get the reference from the database
        return await ref.add(payload); // add the document
    }

    async set(payload:object, ...param:any) {
        const ref = this.getFirebaseRef(this.path);           //  get the reference from the database
        return await ref.set(payload, ...param); // set the document
    }

    async update(payload:object) {
        const ref = this.getFirebaseRef(this.path);           //  get the reference from the database
        return await ref.update(payload); // update the document
    }

    async delete() {
        const ref = this.getFirebaseRef(this.path);           //  get the reference from the database
        return await ref.delete(); // delete the document
    }

    /**
     *
     * @method get
     * Get a snapshot from the cache.
     *
     * @param   path    The valid path to the reference
     * @return  any     The result of calling `.get()` on the database reference
     *
     * Logic:
     *  If the path is cached, return from cache.
     *  Else, register a snapshot listener to update the cache
     *      and return the newly cached value.
     *
     */

    async get() : Promise<object> {
        let path = this.path;
        const TODOstring = JSON.stringify(path);        //  strigify to hash array
        if (!cache.has(TODOstring)) {                   //  if path string isn't cached
            // TODO: comment this out someday \/
            const ref = this.getFirebaseRef(path);           //  get the reference from the database
            cache.set(TODOstring, ref.get());           //  save result in cache
            unsubscribeCallbacks.set(TODOstring,        //  TODO: comment this code, someday
                                     ref.onSnapshot({
                                         error: console.trace,
                                         next: (snap:any) => {
                                             cache.set(TODOstring, snap);
                                             //requestRefresh();
                                             // TODO TODO: requestRefresh
                                         }
                                     })
                                    );
        }
        return await cache.get(TODOstring);
    }

    /**
     *
     * @method getFirebaseRef
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
     * 
     */

    getFirebaseRef(path:string[]) {
        let ref:any = this.firebaseDB;
        let fsRef:any = this.firebaseRef;

        // special handling for first collection from root
        console.assert(typeof path[0] === 'string');
        if (path[0].includes('/'))
            ref = ref.collectionGroup(path[0]);
        else
            ref = ref.collection(path[0]);
        // generic handling
        for (let n of path.slice(1)) {
            let nav:any = n;
            if (typeof nav === 'string') {
                if (ref instanceof fsRef.DocumentReference) {
                    ref = ref.collection(nav);
                } else if (ref instanceof fsRef.Query) {
                    ref = ref.doc(nav);
                } else {
                    throw new Error("Unknown reference");
                }
            } else if (Array.isArray(nav)) {                // query, TODO shouldn't need to query
                if (ref instanceof fsRef.Query) {
                    ref = ref.where(...nav);
                } else {
                    throw new Error("Cannot query with");
                }
                console.assert(ref instanceof fsRef.Query)
            } else {
                throw new Error("Cannot parse");
            }
        }
        return ref;
    }
}

class FirebaseAuthenticationProvider extends AuthenticationProvider {
    private firebaseAuthPointer: firebase.auth.Auth;

    constructor() {
        super();
        this.firebaseAuthPointer = firebase.auth();

        if (this.firebaseAuthPointer.currentUser)
            this._authenticated = true;
        else
            this._authenticated = false;
    }

    get currentUser() : AuthenticationUser {
        if (!this.firebaseAuthPointer.currentUser) return null;

        return {
            identifier: this.firebaseAuthPointer.currentUser.uid,
            displayName: this.firebaseAuthPointer.currentUser.displayName,
            email: this.firebaseAuthPointer.currentUser.email
        }
    }

    async authenticate(request: AuthenticationRequest) : Promise<AuthenticationResult> {
        if (request.requestType == "email_pass" || !request.requestType) {
            await this.firebaseAuthPointer.signInWithEmailAndPassword(request.payload.email, request.payload.password)        
            if (this.firebaseAuthPointer.currentUser.emailVerified)
                this._authenticated = true;
            return {
                actionDesired: "authenticate", 
                actionSuccess: this.firebaseAuthPointer.currentUser.emailVerified ? true : false, 
                identifier: this.firebaseAuthPointer.currentUser.uid, 
                payload: this.firebaseAuthPointer.currentUser.emailVerified ? null : {msg: "User email unverified", code: "email_verification_needed"}
            }
        }
        else 
            return {
                actionDesired: "authenticate", 
                actionSuccess: false, 
                identifier: null, 
                payload: {msg: "Unknown request type", code: "unknown_request_type"}
            };
    }

    async deauthenticate() {
        this.firebaseAuthPointer.signOut();
        this._authenticated = false;
    }

    async createUser(request: AuthenticationRequest) : Promise<AuthenticationResult> {
        try {
            await this.firebaseAuthPointer.createUserWithEmailAndPassword(request.payload.email, request.payload.password);
            // TODO should we remove email verification requirement??
            this.firebaseAuthPointer.currentUser.sendEmailVerification();
            this._authenticated = true;
            return {
                actionDesired: "createUser", 
                actionSuccess: true, 
                identifier: this.firebaseAuthPointer.currentUser.uid, 
                payload: null
            }
        } catch (err) {
            return {
                actionDesired: "createUser", 
                actionSuccess: false, 
                identifier: null, 
                payload: {msg: err.message, code: err.code}
            };
        }
    }

    async updateUserProfile(request: AuthenticationRequest) : Promise<AuthenticationResult> {
        if (!this._authenticated) 
            return {
                actionDesired: "updateUserProfile", 
                actionSuccess: false, 
                identifier: null, 
                payload: {msg: "Cannot update a non-existent user", code: "user_missing"}
            };
        try {
            this.firebaseAuthPointer.currentUser.updateProfile(request.payload);
            return {
                actionDesired: "updateUserProfile", 
                actionSuccess: true, 
                identifier: this.firebaseAuthPointer.currentUser.uid, 
                payload: null
            }
        } catch (err) {
            return {
                actionDesired: "updateUserProfile", 
                actionSuccess: false, 
                identifier: null, 
                payload: err
            };
        }
    }
}

/**
 * 
 * @Class FirebaseProvider.
 *
 * A backend provider that provides for Condution connection to Firebase
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

class FirebaseProvider extends Provider {
    name: string;
    firebaseDB: firebase.firestore.Firestore;
    firebaseRef: typeof firebase.firestore;

    private authProvider: AuthenticationProvider;

    constructor(name:string="firebase") {
        super();

        this.name = name;

        // Yes, we support auth
        this._authSupported = true;

        // Get our shared secrets file
        const obj = require("./../../../secrets.json");

        // Initialize the correct version of the database
        if (process.env.NODE_ENV === "development")
            firebase.initializeApp(obj.dbkeys.debug);
        else if (process.env.NODE_ENV === "production")
            firebase.initializeApp(obj.dbkeys.deploy);
        else
            firebase.initializeApp(obj.dbkeys.debug);

        // Initialize and add the provider
        this.authProvider = new FirebaseAuthenticationProvider();

        // Get firestore references
        [ this.firebaseDB, this.firebaseRef ] = [firebase.firestore(), firebase.firestore];

        // Enable Persistance
        this.firebaseDB.enablePersistence({synchronizeTabs: true}).catch((e)=>console.log(`CondutionEngine (FirebaseProvider): persistance enabling failed due to code "${e.code}"`));
    }
    
    /**
     *
     * @method reference
     *
     * @param {string[]} path: path that you desire to get a reference to
     * @returns {Page}:a page representing the reference that you could act upon
     *
     * Example:
     *
     * > let ref = manager.reference("users, "test", "tasks", "434d5fab10129a");
     * > let values = ref.get();
     * 
     */

    reference(path: string[]) : Page {
        return new FirebasePage(path, this.firebaseDB, this.firebaseRef);
    }

    /**
     *
     * @property authenticationProvider
     *
     * Return the AuthenticationProvider instance bundled with the Provider, 
     * if that is supposed to be a thing
     *
     */

    get authenticationProvider() {
        return this.authProvider;
    }
   
    /**
     *
     * @method flush
     * 
     * Nuke the cache
     * Used for logging out and general cleanup
     *
     */

    flush() {
        cache = new Map();
        unsubscribeCallbacks = new Map();
    }
}

export default FirebaseProvider;
export { FirebasePage };

