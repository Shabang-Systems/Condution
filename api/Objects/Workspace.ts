import { Page } from "../Storage/Backends/Backend";
import { Context } from "./EngineManager";

export default class Workspace {
    private page:Page;

    protected constructor(context:Context, identifier?:string, email?:string) {
        if (identifier)
            this.page = context.page(["workspaces", identifier], this.update, true);
    }

    static fetch(context:Context, identifier:string):Workspace {
        return new this(context, identifier=identifier);
    }

    private update(newData:object) {
    }

    //static async create(context:Context, email:string):Promise<Workspace> {
    //}
}

