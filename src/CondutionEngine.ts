import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";
import Workspace from "./Objects/Workspace";
import Task from "./Objects/Task";
import Tag from "./Objects/Tag";
import { RepeatRule, RepeatRuleType } from "./Objects/Utils";
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


    /*
       * @lb's grand vision
       * sourcesfilters => condition-based sorted set queried based on data. Deals with one condition
           * Projects + tags => reverse table (and foward table.) static in object
           * 
       * agg => logic??
       * 
       *
    */

    // Query(Task, "prop", "<<", new Date()).execute()

    /*let ws:Workspace[] = await cm.workspaces(); // get yo workspaces!*/


    /*ws[0].name = "aonsteuhasoenut";*/
    /*console.log(ws[0].collaborators);*/

    //ws[0].name = "Heyo!"; // set its name
    //let ws:Workspace = await Workspace.fetch(cm,"tjnfCOZn03vj8GlO3vgg");

    /*let tg:Tag = await Tag.fetch(cm, "EyAZKLxDeRCenp7Ryrr4");*/
    /*console.log(tg.name);*/
    let tg:Tag = await Tag.create(cm, "Bubububububububuubbu");
    console.log(tg.weight);

    /*let task:Task = await Task.fetch(cm, "kvrx4YVeeJTYjcVp2S00");*/
    //CustomFilterQuery(Task, "due", "<", new Date());
    //task.name = "nsatoehusaoe"
    //task.repeatRule = new RepeatRule(RepeatRuleType.WEEK);
    /*Task.SelfDestruct()*/
    /*console.log(task.defer);*/
    /*console.log(task.defer);*/
    /*task.defer = new Date();*/
    /*console.log(task.defer);*/
    /*console.log(task.due);*/
    /*console.log(task.description);*/
    /*task.name = "chicken!";*/
    /*console.log(task.name);*/
    //cm.rescindWorkspace(ws);

    //console.log((await cm.collection(["tasks"]).data())[3]["id"]); // get the name of the first workspace
    //cm.useWorkspace(ws[0]);
    //console.log((await cm.collection(["tasks"]).data())[3]["id"]); // get the name of the first workspace
    //cm.usePersonalWorkspace();
    //console.log((await cm.collection(["tasks"]).data())[3]["id"]); // get the name of the first workspace
    //console.log(cm.collection(["tasks"])[0].data()[0]); // get the name of the first workspace

    //let tasks: Colection = cm.collection(["tasks", "saonehaoeusaonelu"]);
    //console.log(tasks.data());
    //let userPrefs: Page = cm.page([]);
    //console.log(await userPrefs.get());
    //console.log(await oneProject.get());
}

test();

export { ReferenceManager };
