import { Provider, Page, Collection } from "./Backends/Backend";

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
     * @param {string} providerName: the name field of the desired provider
     * @returns {Number}: 0 if successfully set, 1 if provider unimplemented or uninitialized
     * 
     */

    use(providerName: string) : Number {
        let providerCanidates:Provider[] = this.providers.filter(p => p.name === providerName);
        if (providerCanidates.length > 0) {
            this.currentProvider = providerCanidates[0];
            return 0;
        }
        return 1;
    }

    /**
     * 
     * @method page
     *
     * Gets a Page to operate on 
     *
     * Example:
     *
     * > let ref = manager.page("users, "test", "tasks", "434d5fab10129a");
     * > let values = ref.get();
     *
     * @param {string[]} path
     * @returns {Page}
     *
     */

    page(path: string[]) : Page {
        return this.currentProvider.page(path);
    }

    /**
     *
     * @method collection
     *
     * Gets a collection, with is a
     * list of pages, and some other stuff
     * to operate on
     *
     * Example:
     *
     * > let ref = manager.collection("users, "test", "tasks");
     * > let pages = ref.pages();
     *
     * @param {string[]} path
     * @returns {Collection}
     *
     */

    collection(path: string[]) : Collection {
        return this.currentProvider.collection(path);
    }
}

