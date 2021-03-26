import Perspective from "./Objects/Perspective";
import Task from "./Objects/Task";
import Project from "./Objects/Project";

import { Query } from "./Objects/Utils";
import { Context } from "./Objects/EngineManager";
import type { Filterable } from "./Objects/Utils";

/**
 * Collections of Elements
 *
 * Widgets are actually pretty simple things: 
 * they contain a specific Query, probably 
 * the cached results of the Query, and some 
 * hooking system to tell you when stuff changed.
 *
 * @param{Context} context    the context you wish to create the widget from
 *
 */

abstract class Widget {
    protected abstract name:string;
    protected query:Query;
    protected hooks:Function[] = [];

    /**
     * Execute the widget
     *
     * @returns{Promise<Filterable[]>} the desired list
     *
     */

    abstract execute():Promise<Filterable[]>;

    constructor(context:Context) {
        this.query = new Query(context);
    }

    /**
     * Hook a callback to whence this Query updates
     *
     * @param{Function} hookFn    the function you want to hook in
     * @returns{void}
     *
     */

    hook(hookFn: Function): void {
        this.hooks.push(hookFn);
        Query.hook(hookFn);
    }

    /**
     * Unook a hooked callback to whence this Query updates
     *
     * @param{Function} hookFn    the function you want to unhook
     * @returns{void}
     *
     */

    unhook(hookFn: Function): void {
        this.hooks = this.hooks.filter((i:any) => i !== hookFn);
        Query.unhook(hookFn);
    }
}

class PerspectivesMenuWidget extends Widget {
    name = "persp-menu-widget"

    async execute() {
        let allPerspectives:Perspective[] = await this.query.execute(Perspective, (_:Perspective)=>true) as Perspective[];
        allPerspectives.sort((a: Perspective, b: Perspective) => a.order-b.order);

        return allPerspectives;
    }
}

class ProjectMenuWidget extends Widget {
    name = "project-menu-widget"

    async execute() {
        let topProjects:Project[] = await this.query.execute(Project, (i:Project)=> i.topLevel && !i.isComplete) as Project[];
        topProjects.sort((a: Project, b: Project) => a.order-b.order);

        return topProjects;
    }
}

class InboxWidget extends Widget {
    name = "inbox-widget"

    async execute() {
        let inboxTasks:Task[] = await this.query.execute(Task, (i:Task) => (i.project === null) && !i.isComplete) as Task[];

        inboxTasks.sort((a: Task, b: Task) => a.order-b.order);

        return inboxTasks;
    }
}

export { Widget, ProjectMenuWidget, PerspectivesMenuWidget, InboxWidget };

