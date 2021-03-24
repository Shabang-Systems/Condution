import type { Filterable, AdapterData } from "./Utils";

import Task from "./Task";
import Tag from "./Tag";
import Project from "./Project";

import { Query } from "./Utils";
import { Context } from "./EngineManager";

import { Page, Collection } from "../Storage/Backends/Backend";

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
            console.log(unixDate);
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

        switch (this.logicParameter) {
            case "due":
                if (this.operator == "<") compoundAddition = (i:Task) => i.due < this.indepParamData;
                else if (this.operator == ">") compoundAddition = (i:Task) => i.due > this.indepParamData;
                else if (this.operator == "=") compoundAddition = (i:Task) => i.due == this.indepParamData;
                break;
            case "defer":
                if (this.operator == "<") compoundAddition = (i:Task) => i.defer < this.indepParamData;
                else if (this.operator == ">") compoundAddition = (i:Task) => i.defer > this.indepParamData;
                else if (this.operator == "=") compoundAddition = (i:Task) => i.defer == this.indepParamData;
                break;
            case "weight":
                if (this.operator == "<") compoundAddition = (i:Task) => i.weight < this.indepParamData;
                else if (this.operator == ">") compoundAddition = (i:Task) => i.weight > this.indepParamData;
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
                    targets.push(proj);
                    return await proj.async_children;
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

            if (i !== positiveprojects.length) tempResult.push((t:Task) => t.project == positiveprojects[i]);

            negateprojects.forEach((j:Project) => tempResult.push((t:Task) => t.project != j));

            positivetags.forEach((h:Tag) => tempResult.push((t:Task) => t.tags.includes(h)));

            negatetags.forEach((h:Tag) => tempResult.push((t:Task) => !t.tags.includes(h)));

            result.push(tempResult);
        }

        return result;
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

        // get and parse logic capture group
        this.logicGroups = groups.filter((s:string)=>this.logicGroup.test(s)).map((i:string)=>new LogicGroup(query, i));
        // get and parse simple groups
        this.simpleGroups = groups.filter((s:string)=>!this.logicGroup.test(s)).map((i:string) => new SimpleGroup(query, i));

        this.queryEngine = query;
    }


    /**
     * Execute the query per request
     *
     * @returns{Promise<Task[]>}
     *
     */

    async execute():Promise<Task[]> {
        // Index the database
        await this.queryEngine.index();

        // Get parsed queries
        let parsedQueries:((i:Filterable)=>boolean)[][] = [];

        // Calculate all the queries
        (await Promise.all(
            [
                ...this.simpleGroups.map(
                    async (i:SimpleGroup) => 
                    (await i.synthesize()).forEach(
                        (j:((e:Filterable)=>boolean)[])=>parsedQueries.push(j)
                    )
                ), 
                ...this.logicGroups.map(
                    async (i:LogicGroup) => 
                    (await i.synthesize()).forEach(
                        (j:((e:Filterable)=>boolean)[])=>parsedQueries.push(j)
                    )
                ),
            ]
        ));

        // And now... Query!
        let results:Task[][] = await Promise.all(
            parsedQueries.map(
                (i:any) => this.queryEngine.batch_execute(Task, i)
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
        let cachedPerspective:Perspective = Perspective .cache.get(identifier);
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
     * Fetch a tag by Context and ID without waiting database to load
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the tag you want to fetch
     * @returns{Promise<Tag>} the desired tag
     *
     */

    //static lazy_fetch(context:Context, identifier:string):Tag {
        //let cachedTag:Tag = Tag.cache.get(identifier);
        //if (cachedTag)
            //return cachedTag;

        //let tg:Tag= new this(identifier, context);
        //let page:Page = context.page(["tags", identifier], tg.update);

        //tg.page = page;
        //Tag.cache.set(identifier, tg);

        //page.get().then((data:object)=>{
            //tg.data = data;
            //tg._ready = true;
        //});

        //return tg;
    //}

    /**
     * Create a tag based on context, name, and an optional weight
     * @static
     *
     * @param{ontext} context    the context that you are creating from
     * @param{string?} name    the tag's name
     * @param{number?} weight    the tag's weight
     * @returns{Promise<Tag>} the desired tag
     *
     */

    //static async create(context:Context, name?:string, weight?:number):Promise<Tag> {
        //let newTag:DataExchangeResult = await context.collection(["tags"]).add({name, weight:weight?weight:1});

        //let nt:Tag = new this(newTag.identifier, context);
        //let page:Page = context.page(["tags", newTag.identifier], nt.update);
        //nt.data = await page.get();
        //nt.page = page;
        //nt._ready = true;

        //Tag.cache.set(newTag.identifier, nt);
        //return nt;
    //}

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

    /**
     * The name of the tag
     * @property
     *
     */

    set name(newName:string) {
        this.data["name"] = newName;
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
    }

    private update = (newData:object) => {
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

export { PerspectiveQuery, PerspectiveSearchAdapter };
export default Perspective;


