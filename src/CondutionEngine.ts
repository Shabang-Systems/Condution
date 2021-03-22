import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";
import JSONProvider from "./Storage/Backends/JSONBackend";
import Workspace from "./Objects/Workspace";
import Task from "./Objects/Task";
import Tag from "./Objects/Tag";
import Project from "./Objects/Project";
import { RepeatRule, RepeatRuleType, Query } from "./Objects/Utils";
import { Context } from "./Objects/EngineManager";
import { Collection, Page } from "./Storage/Backends/Backend";

require('dotenv').config();

// #!/Shabang | Condution at home:
// - Missing collections/pages are not handled well
// 

async function test(): Promise<void> {
    let provider: JSONProvider = new JSONProvider("../demo.json", "json", __dirname);
    //let datkingodata: Page = provider.page(["users", "hard-storage-user", "tasks", "y0ptg4qd05efgb9dp74sqp9sin503npn"]);
    let test2: Collection = provider.collection(["users", "hard-storage-user", "tasks"]);
    console.log(await (await test2.pages())[0].get());
    //datkingodata.delete();
    //let datkingo:object = await datkingodata.get();
    //datkingo["name"] = "hewo";
    //await datkingodata.update({"name": "don't mess up the mood!"});
    //await datkingodata.set(datkingo);
    //console.log(await datkingodata.get());

    //provider.commit(data);
    //console.log(provider.load());
 //   let provider: FirebaseProvider k= new FirebaseProvider();
    //let manager: ReferenceManager = new ReferenceManager([provider])

    //await provider.authenticationProvider.authenticate({ payload: { email: process.env.USERNAME, password: process.env.PASSWORD } });

    //// --- TODO everything called before this line needs to be refactored... :( ---

    //let cm: Context = new Context(manager); // create the context
    //await cm.start(); // start our context

    /*
       * @lb's grand vision
       * sourcesfilters => condition-based sorted set queried based on data. Deals with one condition
           * Projects + tags => reverse table (and foward table.) static in object
           * 
       * agg => logic??
       * 
       *
    */

    //let tg0:Tag = await Tag.create(cm, "hewo12", 12);
    //let tg1:Tag = await Tag.fetch(cm, "wtTISSFQylNpeZI5xosX");
    //tg.weight = 3;
    //console.log(tg.id);

    //let task:Task = await Task.fetch(cm, "mxzYDkA9gy3cWZCMVIt4");
    //task.tags = [tg1];
    //console.log(task.weight);
    //console.log(await task.calculateWeight())

    //task.inboxify();
    //console.log(task.name);

    //let a:Date = new Date();
    //let proj:Project = await Project.fetch(cm, "HxgywDvXypqaatjnFsFV");
    //let proj1:Project = await Project.fetch(cm, "h1CQPoKdJkJ4PNxN9Gwg");
    //let b:Date = new Date();


    //console.log(task.available)
    //console.log(proj1.available);

    //console.log(task.available)

    //let q:Query = new Query(cm, Task, (i:Task) => i.name=="yes");
    //q.execute();
    //console.log(q.execute());

    //console.log(proj.name);
    //console.log(proj.available);
    //console.log(proj1.weight);
    //console.log(proj.name);
    //await task.inboxify();
    //await task.move(proj);
    //await proj.move(proj1);
    //await proj.bringToTop();
    //console.log(proj1.weight);

    //const actualtask:Task = await Task.fetch(cm, task.id);
    //actualtask.tags = [tg, tg, tg, tg, tg, tg, tg];
    //let weight:number = await actualtask.calculateWeight();
    //let wtf = await actualtask.async_tags;
    //console.log(wtf);
    //console.log(weight);
    //actualtask.tags = actualtask.tags.concat([tg]);
    //console.log("Done! Exit me now.");
}

test();

export { ReferenceManager, FirebaseProvider, Task, Workspace, Tag, Project, Context, RepeatRule, RepeatRuleType, Collection, Page };
