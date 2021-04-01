import type { Filterable, AdapterData } from "./Utils";

import Task from "./Task";
import Tag from "./Tag";
import Project from "./Project";

import { Query } from "./Utils";
import { Context } from "./EngineManager";

import { Page, Collection } from "../Storage/Backends/Backend";

import { DataExchangeResult } from "../Storage/Backends/Backend";

class LogicGroup {
    rawString:string;

    private simpleGroup: RegExp = /\[.*?\]/; // query for the "simple" part of the capture group
    private directionality: RegExp = /^\(*\$/; // $PARAM <=> [FILTER]$PARAM should match; not the other way
    private logicParameterComponent: RegExp = /\[.*?\]\$(\w+)/; // query for the parametered part of the logic [#this .that]$THIS_PART_HERE
    private independentParameterComponent: RegExp = /[^\])]\$([\w- :+-/]+)/; // query for the independent parameter of the logic $THAT_OTHER_PART
    private independentParameterGroupComponent: RegExp = /(\w+) *([+-]*) *(\d*)/; // query for the three parts of the independent parameter. Like today+13
    private operatorTest: RegExp = /([>=<|])/; // the operator >, =, <, |

    private query:Query;
    private simple:SimpleGroup;

    private operator:string;
    private logicParameter:string;
    private indepParameter:string;
    private indepParameterGroups:string[];

    private indepParamData: any;

    constructor(query:Query, queryString:string) {
        this.rawString = queryString;
        this.query = query;

        this.simple = new SimpleGroup(query, [...queryString.match(this.simpleGroup)][0]);

        this.logicParameter = [...this.logicParameterComponent.exec(queryString)][1];
        this.indepParameter = [...this.independentParameterComponent.exec(queryString)][1].trim();
        this.indepParameterGroups = [...this.independentParameterGroupComponent.exec(queryString)];

        let operator: string = [...this.operatorTest.exec(queryString)][1];

        let directionality:boolean = this.directionality.test(queryString);

        if (!directionality) { // flip the sign
            if (operator == "<") operator = ">";
            else if (operator == ">") operator = "<";
        }

        this.operator = operator;

        // Clean all indexes
        this.simpleGroup.lastIndex = 0;
        this.logicParameterComponent.lastIndex = 0;
        this.independentParameterComponent.lastIndex = 0;
        this.operatorTest.lastIndex = 0;
        this.directionality.lastIndex = 0;
        this.independentParameterGroupComponent.lastIndex = 0;

        this.parseIndepParam();
    }

    private parseIndepParam() {
        // Get the param to parse
        let param:string = this.indepParameter;

        // Try to parse as string parameter
        switch (this.indepParameterGroups[1]) {
            case "today": // this is literally the only macro param we have  :(
                let today = new Date(); // today
                // if no more operators, just return
                if (this.indepParameterGroups[2] == '') return this.indepParamData=today, null;
                // if + operator, add the correct number of days
                else if (this.indepParameterGroups[2] == "+") {
                    today.setDate(today.getDate()+parseInt(this.indepParameterGroups[3]));
                    return this.indepParamData=today, null
                }
                // if - operator, subtract the correct number of days
                else if (this.indepParameterGroups[2] == "-") {
                    today.setDate(today.getDate()-parseInt(this.indepParameterGroups[3]));
                    return this.indepParamData=today, null
                }

                break;
        }

        // Early date parse exceptions
        if (param.includes("/") || param.includes("-")) {
            let unixDate:number = Date.parse(param);
            if (!isNaN(unixDate)) return this.indepParamData=new Date(unixDate), null;
        }

        // Try to parse as a number
        let intParam:number = parseFloat(param);
        if (!isNaN(intParam)) return this.indepParamData=intParam, null;

        // Late last-ditch heuristic date parse
        let unixDate:number = Date.parse(param);
        if (!isNaN(unixDate)) return this.indepParamData=new Date(unixDate), null;

        // And finally, we give up
        this.indepParamData = param;
    }

     /**
     * Sythesize the filter functions needed
     * @async
     *
     * @returns{Promise<((i:Filterable)=>boolean)[][]>}
     *
     */

    async synthesize() : Promise<((i:Filterable)=>boolean)[][]> {
        let coreFilters: ((i:Filterable)=>boolean)[][] = await this.simple.synthesize();
        let compoundAddition: ((i:Filterable)=>boolean);

        // Question: Holy heck why are the operators all backwards??? Oh no!!
        // Answer: look at the directionality test. The "correct" direction is
        // independent_param operator task_param
        // but all the queries are shaped as
        // task_param operator independent_param
        //
        // Because jack is dumb.
        //
        // So, here we are. the operators are backwards, but it works™

        switch (this.logicParameter) {
            case "due":
                if (this.operator == ">") compoundAddition = (i:Task) => i.due < this.indepParamData;
                else if (this.operator == "<") compoundAddition = (i:Task) => i.due > this.indepParamData;
                else if (this.operator == "=") compoundAddition = (i:Task) => i.due == this.indepParamData;
                break;
            case "defer":
                if (this.operator == ">") compoundAddition = (i:Task) => i.defer < this.indepParamData;
                else if (this.operator == "<") compoundAddition = (i:Task) => i.defer > this.indepParamData;
                else if (this.operator == "=") compoundAddition = (i:Task) => i.defer == this.indepParamData;
                break;
            case "weight":
                if (this.operator == ">") compoundAddition = (i:Task) => i.weight < this.indepParamData;
                else if (this.operator == "<") compoundAddition = (i:Task) => i.weight > this.indepParamData;
                else if (this.operator == "=") compoundAddition = (i:Task) => i.weight == this.indepParamData;
                break;
            case "name":
                if (this.operator == "=") compoundAddition = (i:Task) => i.name == this.indepParamData;
                else if (this.operator == "") compoundAddition = (i:Task) => i.name.includes(this.indepParamData);
                break;
            case "description":
            case "desc":
                if (this.operator == "=") compoundAddition = (i:Task) => i.description == this.indepParamData;
                else if (this.operator == "") compoundAddition = (i:Task) => i.description.includes(this.indepParamData);
                break;

        }

        coreFilters.forEach((i:Function[]) => i.push(compoundAddition));
        return coreFilters;
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
     * @returns{Promise<((i:Filterable)=>boolean)[][]>}
     *
     */

    async synthesize() : Promise<((i:Filterable)=>boolean)[][]> {
        let positiveprojects:Project[] = [];
        let negateprojects:Project[] = [];

        let positivetags:Tag[] = [];
        let negatetags:Tag[] = [];

        let result:((i:Filterable)=>boolean)[][] = [];

        await Promise.all(this.filters.map(async (filter:string) => {
            // Check for negate condition
            let negate:boolean = filter[0] === "!";

            // Then, slice for negate
            if (negate)
                filter = filter.slice(1);

            // Get the operation (tag? project?)
            let operation:string = filter[0];
            
            // Slice out the operation
            filter = filter.slice(1);

            switch (operation) {
                case ".": 
                // GET READY FOR LOTS OF CODE!! ITS TIME TO: BFS THROUGH THE PROJECT LIST 
                // SO THAT WE GET ALL OF THE SUBPROJECTS!  FUN TIMES AGLORE!!

                // Get matching projects
                let projects:Project[] = await this.query.execute(Project, (i:Project) => i.name === filter) as Project[];

                // List the IDs
                let targets:Project[] = [];

                // Get project children
                let children:(Project|Task)[][] = await Promise.all(projects.map(async (proj:Project) => {
                    await proj.readinessPromise;
                    targets.push(proj);
                    let projChildren = await proj.async_children;
                    return projChildren;
                }));

                // Get subproject list
                let subprojects:Project[] = [];

                // Get the IDs of subprojects
                await Promise.all(children.map(async (projectChildren) => await Promise.all(projectChildren.map(async (item:Project|Task) => {
                    // check if project
                    if (item.databaseBadge === "projects") {
                        // push the ID to target
                        targets.push(item as Project);
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
                            targets.push(item as Project);
                            // push project to list
                            subprojects.push(item as Project);
                        }
                    })
                }

                if (negate) negateprojects = [...negateprojects, ...targets];
                else positiveprojects = [...positiveprojects, ...targets];

                break;

                case "#": 
                // Get the zeroeth matching tag TODO bad idea?
                let tags:Tag[] = await this.query.execute(Tag, (i:Tag) => i.name === filter) as Tag[];
                let tag:Tag = tags[0];

                // That's it! Horray! That was easy.
                if (negate) negatetags.push(tag);
                else positivetags.push(tag);
            }
        }));

        for (let i:number=0; i<=(positiveprojects.length > 0 ? positiveprojects.length-1 : 0 ); i++) {
            let tempResult: ((i:Filterable)=>boolean)[] = [];

            if (i !== positiveprojects.length) tempResult.push((t:Task) => (t.project && t.project.id == positiveprojects[i].id));

            negateprojects.forEach((j:Project) => tempResult.push((t:Task) => ((t.project && t.project.id != j.id))));

            positivetags.forEach((h:Tag) => tempResult.push((t:Task) => (h ? t.tags.map((a:Tag)=>a.id).includes(h.id) : false)));

            negatetags.forEach((h:Tag) => tempResult.push((t:Task) => (
                h ? !t.tags.map((a:Tag)=>a.id).includes(h.id) : false
            )));

            result.push(tempResult);
        }

        return result;
    }
}

class PerspectiveParseError extends Error {
    constructor(m: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PerspectiveParseError.prototype);
    }
}


class PerspectiveQuery {
    rawString:string;

    private groupCapture: RegExp = /(\[.*?\]|\(.*?\))/g; // query for the capture units like [#this] or ([#that]$due < $defer)
    private logicGroup: RegExp = /\(.*?\[[^()]+?]\$.*?\)/; // query test for whether the capture group is a logic group, ([#that]$due < $defer)

    logicGroups:LogicGroup[];
    simpleGroups:SimpleGroup[];

    queryEngine:Query;

    constructor(context:Context, queryString:string) {
        this.rawString = queryString;

        // get all subgroups
        const groups:string[] = [...queryString.match(this.groupCapture)];

        const query:Query = new Query(context);

        try {
            // get and parse logic capture group
            this.logicGroups = groups.filter((s:string)=>this.logicGroup.test(s)).map((i:string)=>new LogicGroup(query, i));
            // get and parse simple groups
            this.simpleGroups = groups.filter((s:string)=>!this.logicGroup.test(s)).map((i:string) => new SimpleGroup(query, i));
        } catch {
            this.logicGroups = [];
            this.simpleGroups = [];
            throw new PerspectiveParseError("CondutionEngine: ah welp. Your perspective query is dud and so I don't know what the heck to do with it.");
        }

        this.queryEngine = query;
    }


    /**
     * Execute the query per request
     *
     * @param{((i:Filterable)=>boolean)?} additionalFilter    any supplimentary filters to the perspective query
     *
     * @returns{Promise<Task[]>}
     *
     */

    async execute(additionalFilter?:((i:Filterable)=>boolean)):Promise<Task[]> {
        // Get parsed queries
        let parsedQueries:((i:Filterable)=>boolean)[][] = [];

        // Calculate all the queries
        let queries:((i:Filterable)=>boolean)[][][] = await Promise.all([
            ...this.simpleGroups.map(
                async (i:SimpleGroup) => (await i.synthesize())
            ), 
            ...this.logicGroups.map(
                async (i:LogicGroup) => (await i.synthesize())
            ),
        ]);

        // Flatten and store the queries 
        queries.forEach((i:any) => 
            i.forEach((j:any)=>parsedQueries.push(j))
        );

        // And now... Query!
        let results:Task[][] = await Promise.all(
            parsedQueries.map(
                (i:any) => this.queryEngine.batch_execute(Task, additionalFilter?[...i, additionalFilter]:i)
            )
        ) as Task[][];

        // And lastly, flatten and uniquitize the query
        let taskSet: Set<Task> = new Set<Task>();
        results.forEach(
            (i:Task[]) => 
                i.forEach((j:Task)=>
                    taskSet.add(j)
                ))

        let flattened:Task[] = Array.from(taskSet.values());
        return flattened;
    }

}

enum AvailabilityTypes {
    AVAIL = "avail",
    REMAIN = "remain",
    FLAGGED = "flagged"
}

enum OrderTypes {
    DUE_ASCEND = "duas",
    DUE_DESCEND = "duds",
    DEFER_ASCEND = "deas",
    DEFER_DESCEND = "deds",
    ALPHABETICAL = "alph",
}

class Perspective {
    private static cache:Map<string, Perspective> = new Map();
    static readonly databaseBadge = "perspectives";

    private hooks:((arg0: Perspective)=>any)[] = [];

    private _id:string;
    private page:Page;

    protected data:object;
    protected context:Context;
    protected _ready:boolean;

    protected constructor(identifier:string, context:Context) {
        this._id = identifier;
        this.context = context;
    }

    /**
     * Nuke the cache
     * @static
     *
     */

    static SelfDestruct() {
        delete Perspective.cache;
        Perspective.cache = new Map();
    }

    /**
     * Fetch a tag by Context and ID
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the tag you want to fetch
     * @returns{Promise<Workspace>} the desired tag
     *
     */

    static async fetch(context:Context, identifier:string):Promise<Perspective> {
        let cachedPerspective:Perspective = Perspective.cache.get(identifier);
        if (cachedPerspective)
            return cachedPerspective;

        let persp:Perspective = new this(identifier, context);
        let page:Page = context.page(["perspectives", identifier], persp.update);

        persp.data = await page.get();
        persp.page = page;
        persp._ready = true;

        Perspective.cache.set(identifier, persp);
        return persp;
    }

    /**
     * Create a new perspective based on name and query
     * @static
     *
     * @param{ontext} context    the context that you are creating from
     * @param{string?} name    the perspective's name
     * @param{string?} query    the perspective's query
     * @returns{Promise<Perspective>} the desired perspective
     *
     */

    static async create(context:Context, name?:string, query?:string):Promise<Perspective> {
        let newPerspective:DataExchangeResult = await context.collection(["perspectives"]).add({name:name?name:"", query:query?query:"[]"});

        let np:Perspective = new this(newPerspective.identifier, context);
        let page:Page = context.page(["perspectives", newPerspective.identifier], np.update);
        np.data = await page.get();
        np.page = page;
        np._ready = true;

        Perspective.cache.set(newPerspective.identifier, np);
        return np;
    }

    /**
     * The name of the tag
     * @property
     *
     */

    get name() {
        this.readiness_warn();
        if (this._ready)
            return this.data["name"];
    }

    set name(newName:string) {
        this.data["name"] = newName;
        this.sync();
    }

    /**
     * The availability of perspective tasks
     * @property
     *
     */

    get availability(): AvailabilityTypes  {
        return this.data["avail"];
    }

    set availability(newAvailibility:AvailabilityTypes) {
        this.data["avail"] = newAvailibility;
        this.sync();
    }

    /**
     * The task ordering of perspective tasks
     * @property
     *
     */

    get taskorder(): OrderTypes {
        return this.data["tord"];
    }

    set taskorder(neworder: OrderTypes) {
        this.data["tord"] = neworder;
        this.sync();
    }

    /**
     * query
     * @property
     *
     */

    get query(): string {
        return this.data["query"];
    }

    set query(newQuery:string) {
        this.data["query"] = newQuery;
        this.sync();
    }

    get parsedQuery(): PerspectiveQuery {
        return new PerspectiveQuery(this.context, this.query);
    }

    /**
     * Execute the Perspective query
     * @async
     * 
     * @returns{Promise<Task[]>}
     *
     */

    async execute(): Promise<Task[]> {

        let additionalFilter:any = () => true;
        switch (this.availability) {
            case AvailabilityTypes.AVAIL:
                additionalFilter = ((i:Task) => i.available);
                break;
            case AvailabilityTypes.REMAIN:
                additionalFilter = ((i:Task) => !i.isComplete);
                break;
            case AvailabilityTypes.FLAGGED:
                additionalFilter = ((i:Task) => (i.isFlagged === true && !i.isComplete));
                break;
        }
        //try {
        let baseTasks:Task[] = await this.parsedQuery.execute(additionalFilter);
//        } catch (e) {
            //if (e instanceof PerspectiveParseError) 
                //return console.error("CondutionEngine: your perspective query is dud! Use queries correctly or else."), [];
            //else 
                //console.log(e)
        //}



        let nodueTasks = baseTasks.filter((i:Task) => !i.due);
        baseTasks = baseTasks.filter((i:Task) => i.due);

        // TODO BAD BAD CODING INCOMING. SHIELD YOUR SEEING BALLS!
        // This is done to be able to chuck the items without a due
        // date onto the bottom of the page.

        switch (this.taskorder) {
            case OrderTypes.DUE_ASCEND:
                baseTasks.sort((a:Task,b:Task) =>
                    a.due.getTime() - b.due.getTime() 
                ); break;
            case OrderTypes.DUE_DESCEND:
                baseTasks.sort((a:Task,b:Task) =>
                    b.due.getTime() - a.due.getTime()
                ); break;
            case OrderTypes.DEFER_ASCEND:
                baseTasks.sort((a:Task,b:Task) =>
                    (a.defer ? a.defer.getTime() : 10000000000) -
                    (b.defer ? b.defer.getTime() : 10000000000)
                ); break;
            case OrderTypes.DEFER_DESCEND:
                baseTasks.sort((a:Task,b:Task) =>
                    (b.defer ? b.defer.getTime() : 1) -
                    (a.defer ? a.defer.getTime() : 1)
                ); break;
            case OrderTypes.ALPHABETICAL:
                baseTasks.sort((a:Task,b:Task) =>
                    (a.name < b.name) ? 1 : -1
                ); break;
        }

        return [...baseTasks, ...nodueTasks];
    }

    
    /**
     * The order of the project
     * @property
     *
     */

    get order() {
        this.readiness_warn();
        if (this._ready)
            return this.data["order"];
    }

    set order(newOrder:number) {
        this.data["order"] = newOrder;
        this.sync();
    }

    /**
     * The identifier of the tag
     * @property
     *
     */

    get id() {
        return this._id;
    }

    /**
     * The readiness of the data
     * @property
     *
     */

    get ready() {
        return this._ready;
    }

    /**
     * Delete the tag!!
     *
     * @returns{void}
     *
     */

    delete() : void {
        this.page.delete();
    }

        /**
     * Hook a callback to whence this perspective updates
     *
     * @param{((arg0: Perspective)=>any)} hookFn    the function you want to hook in
     * @returns{void}
     *
     */

    hook(hookFn: ((arg0: Perspective)=>any)): void {
        this.hooks.push(hookFn);
        Query.hook(hookFn);
    }

    /**
     * Unook a hooked callback to whence this perspective updates
     *
     * @param{((arg0: Perspective)=>any)} hookFn    the function you want to unhook
     * @returns{void}
     *
     */

    unhook(hookFn: ((arg0: Perspective)=>any)): void {
        this.hooks = this.hooks.filter((i:any) => i !== hookFn);
        Query.unhook(hookFn);
    }

    /**
     * the DB badge of this object type
     * @param
     *
     */

    get databaseBadge() : string {
        return "perspectives";
    }

    private readiness_warn = () => {
        if (!this._ready)
            console.warn("CondutionEngine: you tried to access an object that was fetched syncronously via lazy_fetch yet the underlying data has not yet been downloaded. You could only access the ID for the moment until data is downloaded. For Shame.");
    }

    protected sync = () => {
        this.page.set(this.data);
        this.hooks.forEach((i:Function)=>i(this));
    }

    private update = (newData:object) => {
        this.hooks.forEach((i:Function)=>i(this));
        this.data = newData;
    }

    get tempdata() {
        return this.data;
    }
}

class PerspectiveSearchAdapter extends Perspective {
    private static adaptorCache:Map<string, PerspectiveSearchAdapter> = new Map();

    constructor(context:Context, id:string, data:AdapterData) {
        super(id, context);

        this.data = data.tagCollection.filter((obj:object)=> obj["id"] === id)[0];
        if (!this.data) 
            this.data = {}
        this._ready = true;
    }

    protected sync = () => {
        console.warn("You tried to edit the value of an object in the middle of a search adaptor. That's an awfully bad idea. Don't do that. No stop.");
    }

    /**
     * Produce the desired object
     *
     * @param{Context} context    the context that you are seeding from
     * @param{string} id    the id of the object desired
     * @param{object} data    the seed data
     *
     */

    async produce() : Promise<Perspective> {
        return await Perspective.fetch(this.context, this.id);
    }

    /**
     * Seed a searchable item
     *
     * @param{Context} context    the context that you are seeding from
     * @param{string} id    the id of the object desired
     * @param{object} data    the seed data
     *
     */

    static async seed(context:Context, identifier:string, data:AdapterData) {
        let cachedPerspective:PerspectiveSearchAdapter = PerspectiveSearchAdapter.adaptorCache.get(identifier);
        if (cachedPerspective) return cachedPerspective;

        let tsk:PerspectiveSearchAdapter = new this(context, identifier, data);
        PerspectiveSearchAdapter.adaptorCache.set(identifier, tsk);

        return tsk;
    }

    /**
     * Nuke the cache
     * @static
     *
     * @returns{void}
     */

    static cleanup = () : void => {
        delete PerspectiveSearchAdapter.adaptorCache;
        PerspectiveSearchAdapter.adaptorCache = new Map();
    }
}

export { PerspectiveQuery, PerspectiveSearchAdapter, AvailabilityTypes, OrderTypes };
export default Perspective;

