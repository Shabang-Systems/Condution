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

    async execute(): Promise<Task[]> {
        let inboxTasks:Task[] = await this.query.execute(Task, (i:Task) => (i.project === null) && !i.isComplete) as Task[];

        inboxTasks.sort((a: Task, b: Task) => a.order-b.order);

        return inboxTasks;
    }
}

class CompletedWidget extends Widget {
    name = "completed-widget"

    async execute() {
	let completedTasks:Task[] = await this.query.execute(Task, (i:Task) => (i.isComplete)) as Task[];
	let completedProjects:Project[] = await this.query.execute(Project, (i:Project) => (i.isComplete)) as Project[];

	let completedItems = [...completedTasks, ...completedProjects]

	const cpSorted = completedItems.sort(function(b:Task|Project, a:Task|Project) { return a.completeDate.getTime() - b.completeDate.getTime() })

	let today = new Date();
	let yesterday = new Date();
	let thisWeek = new Date();
	let thisMonth = new Date();
	today.setHours(0,0,0,0);
	yesterday.setDate(yesterday.getDate()-1);
	yesterday.setHours(0,0,0,0);
	thisWeek.setDate(thisWeek.getDate()-7);
	thisWeek.setHours(0,0,0,0);
	thisMonth.setMonth(thisMonth.getMonth()-1);
	thisMonth.setHours(0,0,0,0);
	let tasksToday = cpSorted.filter(function (a) {
	    let tsks = a;
	    return tsks.completeDate ? new Date(tsks.completeDate.getTime() * 1000) >= today : false;
	});
	let tasksYesterday = cpSorted.filter(function (a) {
	    let tsks = a;
	    return tsks.completeDate ? new Date(tsks.completeDate.getTime() * 1000) >= yesterday && new Date(tsks.completeDate.getTime() * 1000) < today : false;
	});
	let tasksWeek = cpSorted.filter(function (a) {
	    let tsks = a;
	    return tsks.completeDate ? new Date(tsks.completeDate.getTime() * 1000) >= thisWeek && new Date(tsks.completeDate.getTime() * 1000) < yesterday : false;
	});
	let tasksMonth = cpSorted.filter(function (a) {
	    let tsks = a;
	    return tsks.completeDate ? new Date(tsks.completeDate.getTime() * 1000) >= thisMonth && new Date(tsks.completeDate.getTime() * 1000) < thisWeek : false;
	});
	let evenBefore = cpSorted.filter(function (a) {
	    let tsks = a;
	    return tsks.completeDate ? new Date(tsks.completeDate.getTime() * 1000) < thisMonth : true;
	});

	return [tasksToday, tasksYesterday, tasksWeek, tasksMonth, evenBefore];
    }
}




export { Widget, ProjectMenuWidget, PerspectivesMenuWidget, InboxWidget };

