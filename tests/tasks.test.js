import ReferenceManager from "../Storage/ReferenceManager";
import FirebaseProvider from "../Storage/Backends/FirebaseBackend";
import Workspace from "../Objects/Workspace";
import Task from "../Objects/Task";
import Tag from "../Objects/Tag";
import Project from "../Objects/Project";
import { RepeatRule, RepeatRuleType } from "../Objects/Utils";
import { Context } from "../Objects/EngineManager";
import { Collection, Page } from "../Storage/Backends/Backend";

await provider.authenticationProvider.authenticate({ payload: { email: process.env.USERNAME, password: process.env.PASSWORD } });

let cm: Context = new Context(manager); // create the context
await cm.start(); // start our context

test('create task', async () => {
    expect(Task.create(cm, "name").name).toBe("name");
});
