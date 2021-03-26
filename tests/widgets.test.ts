/*
 * Howdy folk, this is the test for the Widgets API
 * We test objects here using a demo JSON database
 * and with Condution objects.
 *
 * Indeed, we do not check if JSONBackend is working
 * so you should probably do our Backends test FIRST
 * before this lovely file so that you know if the JSON
 * backend failed.
 *
 * We also don't check if the Objects are working as
 * indended, so, you get to do that.
 *
 * We use JSON because that's easier than testing on a
 * live database. If you think that's irresponsible
 * refer yourself to the FirebaseProvider test where
 * we test Firebase for some simple functions.
 *
 */

import JSONBackend from "../src/Storage/Backends/JSONBackend";

import ReferenceManager from "../src/Storage/ReferenceManager";
import { Context } from "../src/Objects/EngineManager";

import Project from "../src/Objects/Project";

import { ProjectMenuWidget, PerspectivesMenuWidget } from "../src/Widget";

let cm:Context;

beforeAll(async (done) => {
    let provider: JSONBackend = new JSONBackend("./demodata.json", "json", __dirname); // fetch our data
    let manager: ReferenceManager = new ReferenceManager([provider]); // get the ReferenceManager

    cm = new Context(manager); // create the context
    await cm.start(); // start our context

    done();
});

test("perspectives menu widget", async (done) => {
    let widget:PerspectivesMenuWidget = new PerspectivesMenuWidget(cm);
    expect(await widget.execute()).toEqual(expect.anything());
    
    done();
});

test("project menu widget", async (done) => {
    let widget:ProjectMenuWidget = new ProjectMenuWidget(cm);
    let projectResult:Project[] = await widget.execute();

    let result:boolean = true;
    projectResult.map((i:Project) => i.topLevel)
        .forEach((i:boolean) => result = result && i);

    projectResult.map((i:Project) => !i.isComplete)
        .forEach((i:boolean) => result = result && i);

    expect(result).toBe(true);
    
    done();
});




