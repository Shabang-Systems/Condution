import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";

require('dotenv').config();

async function test() {
    let manager:ReferenceManager = new ReferenceManager([new FirebaseProvider()])
    manager.use("firebase");

    await manager.currentProvider.authenticationProvider.authenticate({payload: {email: process.env.USERNAME, password:process.env.PASSWORD}});
}


export { ReferenceManager };
