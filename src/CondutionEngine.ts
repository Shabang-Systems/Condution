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
 * To use ReferenceManagers, instantiate with instances of the Providers that you
 * want to setup. Then, call .use on the name on the provider's name that you want
 * to use. Finally, query for a reference as shown below.
 *
 * > let manager = new ReferenceManager([new FirebaseProvider(), new JSONProvider()]);
 * > manager.use("firebase");
 * > manager.reference(["users, "test", "tasks", "434d5fab10129a"]).get();
 *
 * And kaboom you get an object of task by user `test` by ID `434d5fab10129a`.
 *
 */

import ReferenceManager from "./Storage/ReferenceManager";

/*
 * Chapter 3: The Context
 *
 * This is THE most important piece of thing that may be confusing. Contexts are
 * a layer above managers that allow you to actually query for specific pages by
 * users, manage workspaces, and get data using a similar syntax as does Managers 
 * but without the confusing confusal of needing the know the UID, worry about workspaces
 * etc.
 *
 * To start, pass a manager to the Context to instantiate it. Then, run the async start
 * function to load workspaces and chains.
 *
 * > let cm: Context = new Context(manager); // create the context
 * > await cm.start()
 * > await cm.reference(["tasks", "434d5fab10129a" ]).get()
 *
 */

import { Context } from "./Objects/EngineManager";

/*
 * Chapter 4: The Objects
 *
 * Here are all the objects that Condution could manage for you! Tasks, Tags, Projects
 * all the rage! Unfortunately I am too swollen to type up docs at the moment, so
 * TODO and just look in the inline documentation for yourself
 *
 */

import Workspace from "./Objects/Workspace";
import Task, { TaskSearchAdapter } from "./Objects/Task";
import Tag, { TagSearchAdapter } from "./Objects/Tag";
import Project, { ProjectSearchAdapter } from "./Objects/Project";
import Perspective, { PerspectiveQuery, AvailabilityTypes, OrderTypes } from "./Objects/Perspective";

/*
 * Chapter 5: Utilities
 *
 * Bugger that I am bleeding now
 */

import { RepeatRule, RepeatRuleType, Query, Hookifier, Ticket, GloballySelfDestruct } from "./Objects/Utils";
import type { AdapterData, Filterable } from "./Objects/Utils";

let Internal:object = { Collection, Page, Provider }
let Repeat:object = { RepeatRule, RepeatRuleType }
let Utilities:object = { GloballySelfDestruct, Hookifier, Ticket }

export {
    Internal,
    Context,
    Repeat,
    Utilities,
    Workspace, 
    Task, TaskSearchAdapter,
    Tag, TagSearchAdapter,
    Project, ProjectSearchAdapter, Query,
    Perspective, PerspectiveQuery, AvailabilityTypes, OrderTypes,
    FirebaseProvider, JSONProvider,
    ReferenceManager
};

export type { AdapterData, Filterable };

