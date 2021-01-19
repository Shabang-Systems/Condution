import { Page } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";

export default class Workspace {
    private page:Page;

    static fetch(context:Context, identifier:string):Workspace {
        let w:Workspace = new this();
        w.page = context.page_(["workspaces", identifier], w.update);
        return w;
    }

    private update(newData:object) {
    }

    //static async create(context:Context, email:string):Promise<Workspace> {
    //}
}

