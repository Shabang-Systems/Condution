import Task from "./Task";
import Tag from "./Tag";
import Project from "./Project";

import { Query } from "./Utils";

import { Context } from "./EngineManager";

class LogicGroup {
    rawString:string;

    private simpleGroup: RegExp = /\[.*?\]/; // query for the "simple" part of the capture group

    private query:Query;

    constructor(query:Query, querySting:string) {
        this.rawString = querySting;
        this.query = query;
    }
}

class SimpleGroup {
    rawString:string;

    private simpleGroupFilters: RegExp = /(!?[#!.][^#!.\[\]]+)(?<! )/g;  // query for each filter in a simple group

    private query:Query;
    private filters: string[];

    constructor(query:Query, queryString:string) {
        this.rawString = queryString;
        this.query = query;

        // get and store the list of filters
        this.filters = [...queryString.match(this.simpleGroupFilters)];
    }

    /**
     * Sythesize the filter functions needed
     * @async
     *
     * @returns{((i:Filterable)=>boolean)[][]}
     *
     */

    async synthesize() {
        this.filters.map(async (filter:string) => {
            let negate:boolean = filter[0] === "!";
            if (negate)
                filter = filter.slice(1);
            let operation:string = filter[0];
            filter = filter.slice(1);

            switch (operation) {
                case ".": 
                // GET READY FOR LOTS OF CODE!! ITS TIME TO: BFS THROUGH THE PROJECT LIST 
                // SO THAT WE GET ALL OF THE SUBPROJECTS!  FUN TIMES AGLORE!!

                // Get matching projects
                let projects:Project[] = await this.query.execute(Project, (i:Project) => i.name === filter) as Project[];

                // List the IDs
                let targetIDs:string[] = [];

                // Get project children
                let children:(Project|Task)[][] = await Promise.all(projects.map(async (proj:Project) => {
                    targetIDs.push(proj.id);
                    return await proj.async_children;
                }));

                // Get subproject list
                let subprojects:Project[] = [];

                // Get the IDs of subprojects
                await Promise.all(children.map(async (projectChildren) => await Promise.all(projectChildren.map(async (item:Project|Task) => {
                    // check if project
                    if (item.databaseBadge === "projects") {
                        // push the ID to target
                        targetIDs.push(item.id);
                        // push project to list
                        subprojects.push(item as Project);
                    }
                }))));

                // BFS through project list to get all children
                while (subprojects.length > 0) {
                    // Pop the top
                    (await subprojects.pop().async_children).map(async (item:Project|Task) => {
                        // check if project
                        if (item.databaseBadge === "projects") {
                            // push the ID to target
                            targetIDs.push(item.id);
                            // push project to list
                            subprojects.push(item as Project);
                        }
                    })
                }

                

                break;
            }
        });
    }
}


class PerspectiveQuery {
    rawString:string;

    private groupCapture: RegExp = /(\[.*?\]|\(.*?\))/g; // query for the capture units like [#this] or ([#that]$due < $defer)
    private logicGroup: RegExp = /\(\[[^()]+?]\$.*?\)/; // query test for whether the capture group is a logic group, ([#that]$due < $defer)

    logicGroups:LogicGroup[];
    simpleGroups:SimpleGroup[];

    queryEngine:Query;

    constructor(context:Context, queryString:string) {
        this.rawString = queryString;

        // get all subgroups
        const groups:string[] = [...queryString.match(this.groupCapture)];

        const query:Query = new Query(context);

        // get and parse logic capture group
        this.logicGroups = groups.filter((s:string)=>this.logicGroup.test(s)).map((i:string)=>new LogicGroup(query, i));
        // get and parse simple groups
        this.simpleGroups = groups.filter((s:string)=>!this.logicGroup.test(s)).map((i:string) => new SimpleGroup(query, i));

        this.queryEngine = query;
    }

    async execute() {
        // index the database
        await this.queryEngine.index();

        await this.simpleGroups[0].synthesize();
    }
}

export { PerspectiveQuery };



