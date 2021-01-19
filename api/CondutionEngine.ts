import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";
import { Context } from "./Objects/EngineManager";
import Workspace from "./Objects/Workspace";

require('dotenv').config();

async function test() {
    let provider: FirebaseProvider = new FirebaseProvider();
    let manager: ReferenceManager = new ReferenceManager([provider])

    await provider.authenticationProvider.authenticate({ payload: { email: process.env.USERNAME, password: process.env.PASSWORD } });

    let cm: Context = new Context(manager);

    //console.log((await cm.collection(["tasks"]).get()))
}

test();

export { ReferenceManager };

