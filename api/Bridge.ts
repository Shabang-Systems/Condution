import Module from './CondutionCore';
import ReferenceManager from "./Storage/ReferenceManager";
import { Page } from "./Storage/Backends/Backend";

let initialLoad = new Promise((resolve, _) => {
    Module.onRuntimeInitialized = function() {
        resolve(null);
    }
});

export default class CoreBridge {
    started:boolean;
    ref:ReferenceManager;

    constructor(referenceManager:ReferenceManager) {
        this.ref = referenceManager;
    }

    private docRef(arr:string[]) : object {
        let page:Page = this.ref.reference(...arr);
        return {
            get: async function() {
                return (await page.get()).data();
            },
            set: async function(payload:object, merge?:boolean) {
                (await page.set(payload, {merge}));
            }
        }
    }

    private colRef() {
    }

    async start(): Promise<void> {
        await initialLoad;

        // Binding Reference Fuctions
        Module.bindDocRef(this.docRef);
        Module.bindColRef(this.colRef);

        this.started = true;
    }
}
               
                                   
   
                                                   
