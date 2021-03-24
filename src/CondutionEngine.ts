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

import { PerspectiveQuery } from "./Objects/Perspective";

require('dotenv').config();

// #!/Shabang | Condution at home:
// - Missing collections/pages are not handled well
// 


async function test(): Promise<void> {
    let jsprovider: JSONProvider = new JSONProvider("../demo.json", "json", __dirname);
    //provider.commit(data);
    //console.log(provider.load());
    //let fbprovider: FirebaseProvider = new FirebaseProvider("firebase");
    let manager: ReferenceManager = new ReferenceManager([jsprovider])

    //await fbprovider.authenticationProvider.authenticate({ payload: { email: process.env.USERNAME, password: process.env.PASSWORD } });

    //// --- TODO everything called before this line needs to be refactored... :( ---

    let cm: Context = new Context(manager); // create the context
    //cm.useProvider("firebase");
    await cm.start(); // start our context

    let p:PerspectiveQuery = new PerspectiveQuery(cm, "[.woha !.no #hewo12] [!#how] [#goes .it] ($today < [#it .is]$due)");
    p.execute();
    /*
       * @lb's grand vision
       * sourcesfilters => condition-based sorted set queried based on data. Deals with one condition
           * Projects + tags => reverse table (and foward table.) static in object
           * 
       * agg => logic??
       * 
       *
    */
   //let tasktest = await Task.fetch(cm, "y0ptg4qd05efgb9dp74sqp9sin503npn");
   //tasktest.name = "VERY LARGE STRING SO THAT I COULD NOTICE THIS";
   //console.log(tasktest.name);

    //let tg0:Tag = await Tag.create(cm, "hewo12", 12);
    //let tg1:Tag = await Tag.fetch(cm, "wtTISSFQylNpeZI5xosX");
    ////tg.weight = 3;
    ////console.log(tg.id);

    //let task:Task = await Task.create(cm, "another", null, [tg0]);
    ////task.tags = [tg1];
    //console.log(task.weight);
    //console.log(task.name);
    ////console.log(await task.calculateWeight())

    ////task.inboxify();
    ////console.log(task.name);

    ////let a:Date = new Date();
    //console.log(manager.currentProvider);
    //let proj:Project = await Project.fetch(cm, "HxgywDvXypqaatjnFsFV");
//    let proj:Project = await Project.create(cm, "NO SLOW!");
    //task.move(proj);
    //console.log(proj.available);
    //proj.uncomplete();
    //cm.useProvider("json");
    //let proj:Project = await Project.fetch(cm, "HxgywDvXypqaatjnFsFV");
    //console.log(proj.children[0].databaseBadge);
    //let proj1:Project = await Project.fetch(cm, "ri3c5bssrwb29eptavlbnfs87pzsf141f");
    //let proj2:Project = await Project.fetch(cm, "ri3c5bssrwb29eptavlbnfs87pzsf141f");
    //console.log(proj1.name);
    ////let proj1:Project = await Project.fetch(cm, "ri3c5bssrwb29eptavlbnfs87pzsf141f");
    //task.move(proj1);
    //console.log(task.available);
    ////console.log(task.id);
    //let b:Date = new Date();


    //console.log(task.available)
    //console.log(proj1.available);

    //console.log(task.available)

   // let q:Query = new Query(cm); // create a query 
    ////await q.index(); // O(n) through the whole damn database to cache parametres. 
                     //// this is expensive, so don't do it too much
    //console.log((await q.execute( // O(n) or O(logn) to find things. depending on what data you are filtering by.
         //Project,
        //(i:Project) => i.name=="woha!", // like, name!
    //))[0].name);

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

    //const actualtask:Task = await Task.fetch(cm, "Yuc9B6VuWNbQbbxAlnWp");
    //await actualtask.complete();
    //console.log(actualtask.completeDate.toLocaleString());
    //console.log(actualtask.isComplete);
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
