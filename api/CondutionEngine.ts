import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";
import { Context } from "./Objects/EngineManager";
import { Collection, Page } from "./Storage/Backends/Backend";

require('dotenv').config();

async function test() {
    let provider: FirebaseProvider = new FirebaseProvider();
    let manager: ReferenceManager = new ReferenceManager([provider])

    await provider.authenticationProvider.authenticate({ payload: { email: process.env.USERNAME, password: process.env.PASSWORD } });

    // --- TODO everything called before this line needs to be refactored... :( ---

    let cm: Context = new Context(manager);

    let tasks: Collection = cm.collection(["tasks"]);
    //let oneProject: Page = cm.page(["projects", "JRZOFQQYSIzqB65eW5oX"]);
    console.log(await tasks.data());
    //console.log(await oneProject.get());
}

test();

export { ReferenceManager };
