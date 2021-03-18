import ReferenceManager from "../src/Storage/ReferenceManager";
import FirebaseProvider from "../src/Storage/Backends/FirebaseBackend";
import Workspace from "../src/Objects/Workspace";
import Task from "../src/Objects/Task";
import Tag from "../src/Objects/Tag";
import Project from "../src/Objects/Project";
import { RepeatRule, RepeatRuleType } from "../src/Objects/Utils";
import { Context } from "../src/Objects/EngineManager";
import { Collection, Page } from "../src/Storage/Backends/Backend";

require('dotenv').config();

test('create task', async () => {
    let provider: FirebaseProvider = new FirebaseProvider();
    let manager: ReferenceManager = new ReferenceManager([provider]);
    await provider.authenticationProvider.authenticate({ payload: { email: process.env.USERNAME, password: process.env.PASSWORD } });
    let cm: Context = new Context(manager); // create the context
    await cm.start(); // start our context
    
    // let newTask:Task = await Task.create(cm, "name");
    // expect(newTask.name).toBe("name");
});
