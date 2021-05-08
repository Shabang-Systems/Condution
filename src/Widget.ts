import Perspective from "./Objects/Perspective";
import Task from "./Objects/Task";
import Project from "./Objects/Project";
import Tag from "./Objects/Tag";

import { Query, Hookifier } from "./Objects/Utils";
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

    /**
     * Execute the widget
     *
     * @returns{Promise<Filterable[]>} the desired list
     *
     */

    abstract execute():Promise<Filterable[]>|Promise<object>;

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
        Hookifier.push(`Widget.${this.name}`, hookFn);
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
        Hookifier.remove(`Widget.${this.name}`, hookFn);
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
        let inboxTasks:Task[] = await this.query.execute(Task, (i:Task) => (i.async_project === null) && !i.isComplete) as Task[];

        inboxTasks.sort((a: Task, b: Task) => a.order-b.order);

        return inboxTasks;
    }
}

class DueSoonWidget extends Widget {
    name = "duesoon-widget"

    async execute(): Promise<Task[]> {
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate()+1);

        let DSTasks:Task[] = await this.query.execute(Task, (i:Task) => i.available && i.due && i.due < tomorrow && !i.isComplete) as Task[];


        DSTasks.sort((b: Task, a: Task) => (a.due && b.due) ? a.due.getTime()-b.due.getTime() : 0);

        return DSTasks;
    }
}

class CompletedWidget extends Widget {
    name = "completed-widget"

    async execute() {
        let completedTasks:Task[] = await this.query.execute(Task, (i:Task) => (i.isComplete)) as Task[];
        let completedProjects:Project[] = await this.query.execute(Project, (i:Project) => (i.isComplete)) as Project[];

        let completedItems = [...completedTasks, ...completedProjects]

        const cpSorted = completedItems.sort(function(b:Task|Project, a:Task|Project) { return (!a.completeDate || !b.completeDate) ? -1 :  a.completeDate.getTime() - b.completeDate.getTime() })

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
            return tsks.completeDate ? tsks.completeDate >= today : false;
        });
        let tasksYesterday = cpSorted.filter(function (a) {
            let tsks = a;
            return tsks.completeDate ? tsks.completeDate >= yesterday && tsks.completeDate < today : false;
        });
        let tasksWeek = cpSorted.filter(function (a) {
            let tsks = a;
            return tsks.completeDate ? tsks.completeDate >= thisWeek && tsks.completeDate < yesterday : false;
        });
        let tasksMonth = cpSorted.filter(function (a) {
            let tsks = a;
            return tsks.completeDate ? tsks.completeDate >= thisMonth && tsks.completeDate < thisWeek : false;
        });
        let evenBefore = cpSorted.filter(function (a) {
            let tsks = a;
            return tsks.completeDate ? tsks.completeDate < thisMonth : true;
        });

        return [tasksToday, tasksYesterday, tasksWeek, tasksMonth, evenBefore];
    }
}

/**
 * Widget for tags pane get tag collection.
 */

class TagsPaneWidget extends Widget {
    name = "tags-pane-widget"

    async execute(): Promise<Tag[]> {
        let tags:Tag[] = await this.query.execute(Tag, (_: Tag) => (true)) as Tag[];
        return tags;
    }
}


/**
 * Widget for tasks' project dropdown datapack
 *
 * Because of the relative heaviness of DFS, this widget has special
 * merging rules such that recent concurrent calls listen to the same 
 * promise.
 *
 */

class ProjectDatapackWidget extends Widget {
    name = "project-datapack-widget"
    private static dataPromise:Promise<object[]>;
    
    constructor(context:Context) {
        super(context);
        ProjectDatapackWidget.dataPromise = this.calculate();
    }

    async execute() {
        if (!ProjectDatapackWidget.dataPromise)
            ProjectDatapackWidget.dataPromise = this.calculate();

        let data = await ProjectDatapackWidget.dataPromise;
        return data;
    }

    async calculate() {
        // Get a list of top-level projects
        let topProjects:Project[] = await this.query.execute(Project, (i:Project)=> i.topLevel && !i.isComplete) as Project[];
        topProjects.sort((a: Project, b: Project) => a.order-b.order);

        // Task: DFS through the list to get projects
        let result:object[] = [];

        // First, map the depth of all top projects to 0. Stack looks like [obj, depth]
        let stack:any[] = topProjects.map((i:Project)=>[i, 0]);

        // Reverse stack, b/c we want to process the top one first
        stack.reverse();

        while (stack.length > 0) {
            // Pop the top of the stack and push name and level to result
            let popped:[Project,number] = stack.pop();

            if (!popped[0]) // if the data does not exist
                continue;

            //await popped[0].readinessPromise;

            result.push({value: popped[0], label:(":: ".repeat(popped[1]))+popped[0].name});

            // Query for children
            let async_children:(Project|Task)[] = await popped[0].async_children;

            // Get the children that's projects
            async_children = async_children.filter((i:Task|Project) => (i instanceof Project) && (i.isComplete !== true)) as Project[];

            // Reverse the gosh darn list b/c we want to process the top one first
            async_children.reverse();
            
            // And then, push the children to the stack
            async_children.forEach((i:Project) => stack.push([i, popped[1]+1]));
        }

        // Clear the promise after a second for a refetch
        setTimeout(()=>{ProjectDatapackWidget.dataPromise = null}, 5000);

        return result;
    }
}

/**
 * Widget for tags' project dropdown datapack
 *
 * Because of the relative heaviness of DFS, this widget has special
 * merging rules such that recent concurrent calls listen to the same 
 * promise.
 *
 */

class TagDatapackWidget extends Widget {
    name = "tag-datapack-widget"
    private static dataPromise:Promise<object[]>;

    constructor(context:Context) {
        super(context);
        TagDatapackWidget.dataPromise = this.calculate();
    }

    async execute() {
        if (!TagDatapackWidget.dataPromise)
            TagDatapackWidget.dataPromise = this.calculate();

        let data = await TagDatapackWidget.dataPromise;
        return data;
    }

    async calculate() {
        // Get a list of all tags
        let allTags:Tag[] = await this.query.execute(Tag, (_:Tag) => true) as Tag[];

        // Task: DFS through the list to get all tags
        let result:object[] = allTags.map((i:Tag)=>({value: i, label:i.name}));
        
        // Clear the promise after a second for a refetch
        setTimeout(()=>{TagDatapackWidget.dataPromise = null}, 5000);

        return result;
    }
}

/**
 * Widget for Upcoming timeline
 */

class TimelineWidget extends Widget {
    name = "timeline-pane-widget"

    async execute() {
        let tomorrow:Date = new Date();
        tomorrow.setDate(tomorrow.getDate()+1);

        let timeline:Task[] = await this.query.execute(Task, (t:Task)=>(!t.isComplete && t.due && tomorrow < t.due && t.due < new Date(3021, 1,1))) as Task[];

        timeline = timeline.sort((a:Task, b:Task) => (a.due && b.due) ?a.due.getTime() - b.due.getTime():0);
        
        let isSameDateAs:Function = function(aDate:Date, pDate:Date) {
            return (
                aDate.getFullYear() === pDate.getFullYear() &&
                aDate.getMonth() === pDate.getMonth() &&
                aDate.getDate() === pDate.getDate()
            );
        }

        let refrenceDate = new Date();
        let tcontent = [];
        for (let task of timeline) {
            let due = task.due;
            if (!isSameDateAs(due,refrenceDate)) {
                tcontent.push({type:"label", content: due});
                refrenceDate = due;
            }
            tcontent.push({type:"task", content: task});
        }

        return tcontent;
    }
}

export { Widget, ProjectMenuWidget, PerspectivesMenuWidget, InboxWidget, CompletedWidget, ProjectDatapackWidget, TagsPaneWidget, TagDatapackWidget, DueSoonWidget, TimelineWidget };
//new line here
