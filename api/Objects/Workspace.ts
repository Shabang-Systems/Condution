import { Page } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";

export default class Workspace {
    private static cache:Map<string, Workspace> = new Map();

    private id:String;
    private page:Page;
    private data:object;

    protected constructor(identifier:string) {
        this.id = identifier;
    }

    static async fetch(context:Context, identifier:string):Promise<Workspace> {
        let cachedWorkspace:Workspace = Workspace.cache.get(identifier);
        if (cachedWorkspace)
            return cachedWorkspace;

        let wsp:Workspace = new this(identifier);
        let page:Page = context.referenceManager.page(["workspaces", identifier], wsp.update);
        wsp.data = await page.get();
        wsp.page = page;

        Workspace.cache.set(identifier, wsp);
        return wsp;
    }

    private update = (newData:object) => {
        this.data = newData;
    }

    get name() {
        return this.data["meta"]["name"];
    }
}

