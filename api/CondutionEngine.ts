import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";
import ContextManager from "./Objects/ContextManager";

require('dotenv').config();

async function test() {
    let provider: FirebaseProvider = new FirebaseProvider();
    let manager: ReferenceManager = new ReferenceManager([provider])
    manager.use("firebase");

    await provider.authenticationProvider.authenticate({ payload: { email: process.env.USERNAME, password: process.env.PASSWORD } });


    let cm: ContextManager = new ContextManager(manager);
    console.log(await cm.collection("tasks").add({
        repeat: {rule:'none'},
        isFloating: false,
        isFlagged: false,
        tags: [],
        defer: new Date(),
        order: 18,
        isComplete: false,
        timezone: 'America/Los_Angeles',
        project: '',
        name: 'I am automatically added',
        desc: ''
    }));


    //console.log((await cm.collection("tasks").get()))
}

test();

export { ReferenceManager };

