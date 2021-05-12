import { FirebaseProvider, Context, ReferenceManager, GloballySelfDestruct } from "../backend/src/CondutionEngine.ts";

const providers = {
    "firebase": new FirebaseProvider(),
}

let refMgr = new ReferenceManager([providers["firebase"]]);

export default new Context(refMgr, true);

