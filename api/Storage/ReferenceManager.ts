import { Provider, Page, AuthenticationProvider } from "./Backends/Backend";

/*
 * Hello human, good afternoon.
 * I am ReferenceManager.
 *
 * Remember Algobert's cRef? Yeah!
 * That's me.
 *
 * It basically still is the same darn thing.
 * But! It uses abstract classes that you need to
 * implement.
 *
 * So there.
 * 
 * @jemoka
 *
 */


/**
 *
 * @Class ReferenceManager.
 * 
 * What was cRef.
 *
 * Use as the "frontend" API to database functions
 * and point to the real database providers to do
 * actual things. reference
 *
 * Example:
 *
 * > let manager = new ReferenceManager([FirebaseProvider, CapacitorStorageProvider]);
 * > manager.use("firebase");
 * > manager.reference("users, "test", "tasks", "434d5fab10129a");
 * 
 */

export default class ReferenceManager {
    providers: Provider[];
    currentProvider: Provider;

    constructor(engineProviders: Provider[]) {
        this.providers = engineProviders;
    }

    /**
     * 
     * @method use 
     *
     * Which provider to use?
     *
     * @param {String} providerName: the name field of the desired provider
     * @returns {Number}: 0 if successfully set, 1 if provider unimplemented or uninitialized
     * 
     */

    use(providerName: String) : Number {
        let providerCanidates:Provider[] = this.providers.filter(p => p.name === providerName);
        if (providerCanidates.length > 0) {
            this.currentProvider = providerCanidates[0];
            return 0;
        }
        return 1;
    }

    /**
     *
     * @method reference
     *
     * @param {String[]} path: path that you desire to get a reference to
     * @returns {Page}:a page representing the reference that you could act upon
     *
     * Example:
     *
     * > let ref = manager.reference("users, "test", "tasks", "434d5fab10129a");
     * > let values = ref.get();
     * 
     */

    reference(...path:String[]) : Page {
        return this.currentProvider.reference(path);
    }
}

