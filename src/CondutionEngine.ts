/* 
 * (C) Shabang Systems, LLC. All the Legal Words should Goeth here.
 * Good afternoon. If you are looking at this, you are probably wondering
 * about CondutionEngine. If you looked this far, I am surprised, to be honest!
 * Someone actually cares about our codebase?
 *
 * Well, as a reward, I shall explain where each bit in our codebase means,
 * and also export parts for you so that you know 1) what you are importing
 * or at least 2) where to find them.
 *
 * But first, let's do some fun legalese! Ready. Go:
 *

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

 *
 * Now, real talk tho. I am going to import things, transform their
 * shapes, and write some examples for the final export. As I do that, 
 * I will explain what each thing I imported does. If you still don't
 * understand go ahead and checkout our documentation inline. They usually
 * are quite helpful. If that still doesn't meet your high, exquisite
 * standards, checkout our beautiful docs at docs.condution.com.
 *
 * On to the imports! -- @jemoka
 *
 */

/*
 * Chapter 0: Core Providers
 *
 * Core providers are the base of our program. All of our databasing
 * tools inherit from these classes. Even if you are incredibly nosy
 * you usually don't need to touch these things because "all" they do
 * is get specific pages or collections in a JSON-y fashion. 
 *
 * This, of course, is not super useful if you want anything more than a 
 * crappy database caching and access tools. But, most of all of what you 
 * do will at least be at the `Context` cursor level, which is already 
 * pretty low if you ask me.
 *
 */

import { Collection, Page, Provider } from "./Storage/Backends/Backend";

/*
 * Chapter 1: Built-in Providers
 *
 * Our app (app.condution.com) supports at the moment two default database
 * providers: Firebase, and a Lovely JSON. These, therefore, comes bundled
 * into our @condution/engine. Although, it is possible that we will eventually
 * separate these into @condution/firebaseprovider and @condution/jsonprovider
 * but at the moment they are bundled.
 *
 * Providers are database connectors to Condution. They inherit from Backend's
 * Provider class and does the job of Paging Command => data and data => Database.
 * Basically, they are database plugs.
 *
 */

import FirebaseProvider from "./Storage/Backends/FirebaseBackend";
import JSONProvider from "./Storage/Backends/JSONBackend";

/*
 * Chapter 2: ReferenceManager
 *
 * ReferenceManager is the low low low low low low low low low low low low 
 * lowest level API that you perhaps need to deal with. It provides access to
 * a collection of Providers and allows direct, unmitigated API updates.
 *
 * With ReferenceManager's API, you get to control every data entry of Providers
 * except, of course, if you got blocked server-side. This also means that you 
 * could delete whole users (if you have perms) and mess up the DB. So have fun!
 *
 * > let manager = new ReferenceManager([new FirebaseProvider(), new JSONProvider()]);
 * > manager.use("firebase");
 * > manager.reference("users, "test", "tasks", "434d5fab10129a").get();
 *
 * And kaboom you get an object of task by user `test` by ID `434d5fab10129a`.
 *
 */

import ReferenceManager from "./Storage/ReferenceManager";




import Workspace from "./Objects/Workspace";
import Task from "./Objects/Task";
import Tag from "./Objects/Tag";
import Project from "./Objects/Project";
import { RepeatRule, RepeatRuleType, Query } from "./Objects/Utils";
import { Context } from "./Objects/EngineManager";
//import { Collection, Page } from "./Storage/Backends/Backend";

import Perspective, { PerspectiveQuery, AvailabilityTypes, OrderTypes } from "./Objects/Perspective";

require('dotenv').config();

//// #!/Shabang | Condution at home:
//// - Missing collections/pages are not handled well
//// 


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


    //console.log("we are here");
    //console.log(p.simpleGroups[0].filters);
//    let testPersp:Perspective = await Perspective.fetch(cm, "r3dQARV8E4w7h4EnBDX5");
   ////let tasktest = await Task.fetch(cm, "y0ptg4qd05efgb9dp74sqp9sin503npn");
    //console.log("we are here2");
    //console.log(testPersp.query);
    //console.log(await testPersp.execute());
    //console.log("done");
    //tasktest.name = "apple!";
    //console.log(await testPersp.execute());
    //let perspective2:Perspective = await Perspective.create(cm, "Electric Boogaloo");
    //testPersp.query = "[.woha !.no #hewo12] [!#how] [#goes .it] ($519913 > [.woha #hewo12]$due)";
    //console.log(testPersp.tempdata);
    //console.log(testPersp.availability == AvailabilityTypes.REMAIN);
    //console.log("we are here");
    //let queryEngine:Query = new Query(cm);
    //console.log("we are here3");
    //let allofeveryperspective:Perspective[] = await queryEngine.execute(Perspective, (_:Perspective)=>true) as Perspective[];
    //console.log("we are here4");
    //console.log(allofeveryperspective[2]);
    //console.log("DONE::::", (await allofeveryperspective[2].execute()).length);
    //allofeveryperspective.map((p:Perspective) => console.log(p.id, p.name));
    //let p:PerspectiveQuery = new PerspectiveQuery(cm, "[.woha !.no #hewo12] [!#how] [#goes .it] ($519913 > [.woha #hewo12]$due)");
    //console.log(await p.execute());
   //    @lb's grand vision
       //sourcesfilters => condition-based sorted set queried based on data. Deals with one condition
           //Projects + tags => reverse table (and foward table.) static in object
           
       //agg => logic??
       
      
    //console.log(tasktest.name);
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

//export { ReferenceManager, FirebaseProvider, Task, Workspace, Tag, Project, Context, RepeatRule, RepeatRuleType, Collection, Page };
