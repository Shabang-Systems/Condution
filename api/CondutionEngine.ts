import CoreBridge from "./Bridge";
import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";

require('dotenv').config();

async function test() {
    let manager:ReferenceManager = new ReferenceManager([new FirebaseProvider()])
    manager.use("firebase");

    await manager.currentProvider.authenticationProvider.authenticate({payload: {email: process.env.USERNAME, password:process.env.PASSWORD}});

let tasks:any = (await manager.reference("users", "TcZUcte5MFOx410Q8WJ6mRW1Pco1", "tasks").get());
    let cb:CoreBridge = new CoreBridge(manager);
    cb.start().then((res:void) => {
        console.log("ob", res);
    });
}

test();

export { ReferenceManager };
