import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";
import ContextManager from "./Objects/ContextManager";

require('dotenv').config();

async function test() {
    let provider:FirebaseProvider = new FirebaseProvider();
    let manager:ReferenceManager = new ReferenceManager([provider])
    manager.use("firebase");

    await provider.authenticationProvider.authenticate({payload: {email: process.env.USERNAME, password:process.env.PASSWORD}});

    let cm:ContextManager = new ContextManager(manager);
    console.log((await (cm.rRef("tasks").get())).docs[0].data())
}

test();


export { ReferenceManager };
