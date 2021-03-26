/*
 * Howdy folk, this is the test for the Objects API
 * We test objects here using a demo JSON database.
 *
 * Indeed, we do not check if JSONBackend is working
 * so you should probably do our Backends test FIRST
 * before this lovely file so that you know if the JSON
 * backend failed.
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

let cm:Context;

beforeAll(async (done) => {
    let provider: JSONBackend = new JSONBackend("./demodata.json", "json", __dirname); // fetch our data
    let manager: ReferenceManager = new ReferenceManager([provider]); // get the ReferenceManager

    cm = new Context(manager); // create the context
    await cm.start(); // start our context

    done();
});




