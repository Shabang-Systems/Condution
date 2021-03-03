import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";
import Workspace from "./Objects/Workspace";
import { Context } from "./Objects/EngineManager";
import { Collection, Page } from "./Storage/Backends/Backend";

require('dotenv').config();

// #!/Shabang | Condution at home:
// - Missing collections/pages are not handled well
// 

async function test() {
    let provider: FirebaseProvider = new FirebaseProvider();
    let manager: ReferenceManager = new ReferenceManager([provider])

    await provider.authenticationProvider.authenticate({ payload: { email: process.env.USERNAME, password: process.env.PASSWORD } });

    // --- TODO everything called before this line needs to be refactored... :( ---

    let cm: Context = new Context(manager); // create the context
    await cm.start(); // start our context
    let ws:Workspace[] = await cm.workspaces(); // get yo workspaces!
    console.log(ws[0].name); // get the name of the first workspace

    //let tasks: Collection = cm.collection(["tasks", "saonehaoeusaonelu"]);
    //console.log(tasks.data());
    //let userPrefs: Page = cm.page([]);
    //console.log(await userPrefs.get());
    //console.log(await oneProject.get());
}

test();

export { ReferenceManager };
