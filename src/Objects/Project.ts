import type { AdapterData } from "./Utils";

import { Page, DataExchangeResult } from "../Storage/Backends/Backend";
import Task, { TaskSearchAdapter } from "./Task";
import { Query, Hookifier, Ticket } from "./Utils";
import { Context } from "./EngineManager";

class Project {
    private static cache:Map<string, Project> = new Map();
    private static loadBuffer:Map<string, Promise<Project>> = new Map();
    static readonly databaseBadge = "projects";

    private _id:string;
    private _page:Page;

    protected data:object;
    protected _weight:number;
    protected _uncompleteWeight:number;
    protected context:Context;
    protected _ready:boolean;
    protected _available:boolean;

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
        delete Project.cache;
        Project.cache = new Map();
    }

    /**
     * Fetch a project by Context and ID
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the project you want to fetch
     * @returns{Promise<Project>} the desired project
     *
     */

    static async fetch(context:Context, identifier:string):Promise<Project> {
        if (Project.cache.has(identifier))
            return Project.cache.get(identifier); 

        if (Project.loadBuffer.has(identifier))
            return await Project.loadBuffer.get(identifier); 

        let pj:Project = new this(identifier, context);
        pj._ready = false;

        let queryEngine:Query = new Query(context);
        let staticData:AdapterData = await queryEngine.orderStaticData();

        let loadProject:Promise<Project> = new Promise(async (res, _) => {
            let projectData:object = staticData.projectMap.get(identifier);
         
            // TODO janky AF this is to wait
            // until the context loads. Someone
            // somewhere on the frontend team forgot
            // to warm up the context before state
            // propergates
            
            await context.workspaces();

            if (!projectData || projectData == undefined) {
                Project.cache.set(identifier, null);
                res(null); return
            }

            pj.data = projectData;
            pj._ready = true;

            Project.cache.set(identifier, pj);

            await pj.calculateTreeParams();

            res(pj);
        });

        Project.loadBuffer.set(identifier, loadProject); 

        let finalProject = await loadProject;

        return finalProject;
    }

    /**
     * Fetch a project by Context and ID without waiting database to load
     * @static
     *
     * @param{Context} context    the context that you are fetching from
     * @param{string} identifier    the ID of the project you want to fetch
     * @returns{Promise<Project>} the desired project
     *
     */

    //static lazy_fetch(context:Context, identifier:string):Project {
        //if (Project.cache.has(identifier))
            //return Project.cache.get(identifier); 

        //let pj:Project = new this(identifier, context);
        //pj._ready = false;

        //let page:Page = context.page(["projects", identifier], pj.update);
        //pj.page = page;

        //if (!page.exists) {
            //Project.cache.set(identifier, null);
            //return null;
        //}

        //let loadProject:Promise<Project> = new Promise(async (res, _) => {
            //pj.data = await page.get();
            //pj._ready = true;

            //await pj.calculateTreeParams();

            //Project.cache.set(identifier, pj);
            //res(pj);
        //});

        //Project.loadBuffer.set(identifier, loadProject); 

        //return pj;
    //}

    /**
     * Create a project based on context, and optionally name and parent
     * @static
     *
     * @param{Context} context    the context that you are creating from
     * @param{string?} name    the new project's name
     * @param{parent?} parent    the new project's parent
     * @returns{Promise<Project>} the desired project
     *
     */

    static async create(context:Context, name?:string, parent?:Project):Promise<Project> {
        let newProject:DataExchangeResult = await context.collection(["projects"]).add({
            name: name?name:"", 
            parent: parent?parent.id:"",
            top_level: parent?false:true,
            isComplete: false, // HUXLEY! SNAKE CASE
            is_sequential: false,
            children: {}
        });

        let np:Project = new this(newProject.identifier, context);
        let page:Page = context.page(["projects", newProject.identifier], np.update);
        np.page = page;

        let loadProject:Promise<Project> = new Promise(async (res, _) => {
            np.data = await page.get();
            np._ready = true;

            await np.calculateTreeParams();

            Project.cache.set(newProject.identifier, np);
            res(np);
        });

        Project.loadBuffer.set(newProject.identifier, loadProject); 
        let finalProject = await loadProject;

        if (parent)
            parent.associate(finalProject);

        return finalProject;
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
     * The sequentiality of the project
     * @property
     *
     */

    get isSequential() {
        this.readiness_warn();
        if (this._ready)
            return this.data["is_sequential"];
    }

    /**
     * Make the project sequential
     * @async
     *
     * @returns{Promise<void>} 
     *
     */

    async sequential() : Promise<void> {
        this.data["is_sequential"] = true;
        await this.calculateTreeParams(true);
        this.callHooks();
        this.sync();
    }

    /**
     * Make the project parallel
     * @async
     *
     * @returns{Promise<void>} 
     *
     */

    async parallel() : Promise<void> {
        this.data["is_sequential"] = false;
        await this.calculateTreeParams(true);
        this.callHooks();
        this.sync();
    }

    /**
     * The completeness of the project
     * @property
     *
     */

    get isComplete() {
        this.readiness_warn();
        if (this._ready)
            return this.data["isComplete"]; // not a mistake. Blame Huxley.
    }

    /**
     * Uncomplete the project
     * @async
     *
     * @returns{Promise<void>}
     *
     */

    async uncomplete() : Promise<void> {
        this.data["isComplete"] = false;
        await this.calculateTreeParams();
        this.sync();
    }

    /**
     * The complete date of the project
     * @property
     *
     * There exists special handling because
     * for some reason dates were stored by secs + nanosecs
     * in the past. IDK why
     *
     */

    get completeDate() {
        this.readiness_warn();
        if (this._ready && this.data["completeDate"])
            return new Date(this.data["completeDate"]["seconds"]*1000);
        else return null;
    }

    /**
     * Complete the project
     * @async
     *
     * @returns{Promise<void>}
     *
     */

    async complete() : Promise<void> {
        this.data["isComplete"] = true;
        this.sync();
        await this.calculateTreeParams();

        let completeDate = new Date();
        this.data["completeDate"] = {seconds: Math.floor(completeDate.getTime()/1000), nanoseconds:0};
        await this.page.set({completeDate: completeDate}, {merge:true}); // weird date handling

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

    /**
     * Update the order of the task
     * @async
     *
     * @param{number} newOrder    the new desired order
     * @returns{Promise<void>}
     *
     */

    async reorder(newOrder:number) : Promise<void> {
        this.data["order"] = newOrder;
        await this.calculateTreeParams();
        this.sync();
    }

    /**
     * Whether the project is a top level project
     * @property
     *
     */

    get topLevel() {
        this.readiness_warn();
        if (this._ready)
            return this.data["top_level"];
    }

     /**
     * Move the project to...
     *
     * @param{Project?} to    to a project or, if null, to inbox
     * @returns{Promise<void>}
     *
     */

    async moveTo(to?:Project): Promise<void> {
        if (this.data["parent"] && this.data["parent"] !== "") {
            let project:Project = await Project.fetch(this.context, this.data["parent"])
            if(project) await (project).dissociate(this);
        }

        if (to) {
            await to.associate(this);
            this.data["parent"] = to.id;
            this.data["top_level"] = false;
        } else {
            this.data["parent"] = "";
            this.data["top_level"] = true;
        }

        this.sync();
    }

    /**
     * Bring the project to top level
     *
     * @returns{Promise<void>}
     *
     */

    async bringToTop(): Promise<void> {
        await this.moveTo();
    }

    /**
     * The parent of the project
     * @property
     *
     */

    get parent() {
        this.readiness_warn();
        if (this._ready)
            return this.data["parent"] !== "" ? new Ticket(Project, this.context, this.data["parent"]) : null;
    }

    /**
     * The parent of the project, fetched traditionally but asyncronously
     * @property
     *
     */

    get async_parent() {
        this.readiness_warn();

        if (this._ready)
            return (async ()=>(this.data["parent"] && this.data["parent"] !== "") ? await Project.fetch(this.context, this.data["parent"]) : null)();
    }

    /**
     * The child(ren) of the project
     * @property
     *
     * TODO ugly
     *
     */

    get children() {
        this.readiness_warn();
        let dataArray:(Ticket)[] = [];
        if (this._ready) {
            for (let child in this.data["children"])
                if (this.data["children"][child] == "task") {
                    let task:Ticket = new Ticket(Task, this.context, child); 
                    if(task) dataArray.push(task);
                } else if (this.data["children"][child] == "project") {
                    let project:Ticket = new Ticket(Project, this.context, child); 
                    if(project) dataArray.push(project);
                }

            return dataArray;
        }
    }

    /**
     * The child(ren) of the project, fetched traditionally with promises
     * @property
     *
     * TODO ugly
     *
     */

    get async_children() {
        this.readiness_warn();
        if (this._ready) {
            return (async () => {
                let dataArray:(Project|Task)[] = [];
                for (let child in this.data["children"])
                    if (this.data["children"][child] == "task") {
                        let task:Task = await Task.fetch(this.context, child);
                        if(task) dataArray.push(task);
                    } else if (this.data["children"][child] == "project") {
                        let project:Project = await Project.fetch(this.context, child);
                        if(project) dataArray.push(project);
                    }
                return dataArray.sort((a:(Project|Task), b:(Project|Task)) => a.order-b.order);
            })()
        }
  //      if (this.id == "0FDknRdMkhKnDm5urIoy")
            //console.log("sad", i);
        //if (this.id == "oygNp1o5npKjVpquTIOJ")
            //console.log("oygNp1o5npKjVpquTIOJ hath fetched")
        return null;

    }

    /**
     * Associate a task/project with the project's index
     * @async
     *
     * @param{Project|Task} item    the item you want to associate
     * @param{number?} order    force a specific order
     * @returns{Promise<void>}
     *
     */

    async associate(item:Project|Task, order?:number): Promise<void> {
        if (!order)
            order = Object.keys(this.children).length;
        await item.reorder(order);
        this.data["children"][item.id] = (item instanceof Task) ? "task" : "project";
        await this.calculateTreeParams(true);
        this.sync();
    }

    /**
     * Dissociate a task/project with the project's index
     * @async
     *
     * @param{Project|Task} item    the item you want to dissociate
     * @returns{Promise<void>}
     *
     */

    async dissociate(item:Project|Task): Promise<void> {
        delete this.data["children"][item.id];
        await this.calculateTreeParams(true);
        this.sync();
    }

    /**
     * Associate a whole bunch of tasks/projects with the project's index
     * @async
     *
     * @param{(Project|Task)[]} items    the items you want to associate
     * @returns{Promise<void>}
     *
     */

    async batch_associate(items:(Project|Task)[]): Promise<void> {
        let order:number = Object.keys(this.children).length

        for (let i of items) {
            await i.reorder(order);
            order++;
            this.data["children"][i.id] = (i instanceof Task) ? "task" : "project";
        }

        await this.calculateTreeParams(true);
        this.sync();
    }

    /**
     * Dissociate a whole bunch of tasks/projects with the project's index
     * @async
     *
     * @param{(Project|Task)[]} items    the items you want to dissociate
     * @returns{void}
     *
     */

    async batch_dissociate(items:(Project|Task)[]): Promise<void> {
        for (let i of items) {
            delete this.children[i.id];
        }

        await this.calculateTreeParams(true);
        this.sync();
    }

    /**
     * Delete the project!!
     * @async
     *
     * @returns{Promise<void>}
     *
     */

    async delete() : Promise<void> {
        let async_parent = await this.async_parent;
        if (async_parent)
            await (async_parent).dissociate(this);

        this.page.delete();
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
     * get weight of the project
     * @param
     *
     */

    get weight() : number {
        return this._weight;
    }

    /**
     * get the uncompleted task weight of the project
     * @param
     *
     */

    get uncompleteWeight() : number {
        return this._uncompleteWeight;
    }


    /**
     * availablitiy of the project
     * @param
     *
     */

    get available() : boolean {
        return this._available;
    }

    /**
     * the DB badge of this object type
     * @param
     *
     */

    get databaseBadge() : string {
        return "projects";
    }

    /**
     * DFS + lift to get weight and availibilty of the project wrt its directory
     *
     * Generally, you don't have a need to call this
     * and you should simply let this happen automagically
     * as tasks change and as other stuff happen like fetch
     * or create. However, you could force a tree flush
     * for your entertainment if you really wanted to.
     *
     * @param{boolean?} withHook    call hooks on flush
     *
     * @returns{Promise<void>}
     *
     */

    calculateTreeParams = async (withHook:boolean=false) : Promise<void> => {
        // Get the parent project
        let parent_proj:Project = await this.async_parent;

        // If we have a parent project
        if (parent_proj) {

            // ... and it's sequential
            if (parent_proj.isSequential)
                this._available = (parent_proj.available && this.order == 0 && !this.isComplete); // availablitiy is based on order
            else
                this._available = (parent_proj.available && !this.isComplete); // and get the availibilty
        } else if (this.isComplete !== undefined && this.isComplete !== null)// if its complete
            this._available = !this.isComplete; // its availibilty is based on completenessk
        else
            this._available = true;

        // Set weight variables to zero
        this._weight = 0;
        this._uncompleteWeight = 0;

        if (this && this.async_children) {
            // Get async children
            let children:(Project|Task)[] = (await this.async_children);

            // Get weights by DFS, while flushing the availibilty of children
            let weights:number[] = await Promise.all(children.map(async (i):Promise<number> => {
                // Flush their availibilty
                await i.calculateTreeParams();

                // Return their weight
                return i.weight;
            }));

            // Get uncompleted weights by DFS
            let uncompletedWeights:number[] = await Promise.all(children.map(async (i):Promise<number> => {
                // Return their weight
                if (i.databaseBadge==="tasks" && i.isComplete)
                    return 0;
                else if (i.databaseBadge==="tasks")
                    return i.weight;
                else
                    return (i as Project).uncompleteWeight;
            }));

            // Sum the weight as new weight
            weights.forEach((i:number) => this._weight+=i);
            uncompletedWeights.forEach((i:number) => this._uncompleteWeight+=i);
        }

        if (withHook)
            Hookifier.call(`project.${this.id}`);
    }
    
    /**
     * Hook a callback to whence this task updates
     *
     * @param{((arg0: Task)=>any)} hookFn    the function you want to hook in
     * @returns{void}
     *
     */

    hook(hookFn: ((arg0: Project)=>any)): void {
        if (this._page == null) // on hook, make sure that the task is live
            this._page = this.context.page(["projects", this.id], this.update);
        Hookifier.push(`project.${this.id}`, hookFn);
    }

    /**
     * Unook a hooked callback to whence this task updates
     *
     * @param{((arg0: Project)=>any)} hookFn    the function you want to unhook
     * @returns{void}
     *
     */

    unhook(hookFn: ((arg0: Project)=>any)): void {
        Hookifier.remove(`project.${this.id}`, hookFn);
    }

    /**
     * Util function to call hooks
     * @async
     *
     * @param{boolean} recursive    call child's hooks?
     * @returns{Promise<void>}
     */

    async callHooks(): Promise<void> {
        Hookifier.call(`project.${this.id}`);

        let children:(Project|Task)[] = await this.async_children;
        children.map((i:(Project|Task)) => i.callHooks());
    }

    private get page() {
        if (this._page == null)
            this._page = this.context.page(["projects", this.id], this.update);
        return this._page;
    }

    private set page(newPage:Page) {
        this._page = newPage;
    }

    private readiness_warn = () => {
        // TODO
//        if (!this._ready)
            //console.warn("CondutionEngine: you tried to access a bubbubbubu object that was fetched syncronously via lazy_fetch yet the underlying data has not yet been downloaded. You could only access the ID for the moment until data is downloaded. For Shame.");
    }

    protected sync = () => {
        this.page.set(this.data);
        Hookifier.call(`project.${this.id}`);
    }

    private update = (newData:object) => {
        if (this._ready) {
            Hookifier.call(`project.${this.id}`);
            this.calculateTreeParams(true);
        }
        this.data = newData;
    }

}

class ProjectSearchAdapter extends Project {

    adaptorData: AdapterData;
    private static loadCache:Map<string, Promise<ProjectSearchAdapter>> = new Map();
    private static adaptorCache:Map<string, ProjectSearchAdapter> = new Map();

    constructor(context:Context, id:string, data:AdapterData, taskData:object) {
        super(id, context);
        this.data = taskData;

        if (!this.data)
            this.data = {};

        this.adaptorData = data;
        this._ready = true;
    }

    get async_children() {
        return (async () => {
            let dataArray:(Project|Task)[] = [];
            for (let child in this.data["children"])
                if (this.data["children"][child] == "task")
                    dataArray.push(await TaskSearchAdapter.seed(this.context, child, this.adaptorData));
                else if (this.data["children"][child] == "project")
                    dataArray.push(await ProjectSearchAdapter.seed(this.context, child, this.adaptorData));
            return dataArray;
        })()
    }

    /**
     * Nuke the cache
     * @static
     *
     * @returns{void}
     */

    static cleanup = () : void => {
        delete ProjectSearchAdapter.adaptorCache;
        ProjectSearchAdapter.adaptorCache = new Map();
    }

    get async_parent() {
        return this.data["parent"] !== "" ? ProjectSearchAdapter.seed(this.context, this.data["parent"], this.adaptorData) : null;
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

    async produce() : Promise<Project> {
        let project:Project = await Project.fetch(this.context, this.id);
        return project;
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
        if (ProjectSearchAdapter.adaptorCache.has(identifier)) return ProjectSearchAdapter.adaptorCache.get(identifier);
        if (ProjectSearchAdapter.loadCache.has(identifier)) return await ProjectSearchAdapter.loadCache.get(identifier);

        let loadProject:Promise<ProjectSearchAdapter> = (async () => {
            let projectData:object = data.projectCollection.filter((obj:object)=> obj["id"] === identifier)[0];

            if (!projectData)
                return null;

            let tsk:ProjectSearchAdapter = new this(context, identifier, data, projectData);

            ProjectSearchAdapter.adaptorCache.set(identifier, tsk);

            // await tsk.calculateTreeParams();
            // TODO IDK how the frick searching projects
            // by weight is not fricked up but shock surprise
            // IT ISNT?????? HOW?????? IDK
            //
            // But awaiting tree param refresh crashes JSON mode
            // surprise! IDK why.

            tsk.calculateTreeParams();
            return tsk;
        })();
        
        ProjectSearchAdapter.loadCache.set(identifier, loadProject);
        

        return await loadProject;
    }
}

export { ProjectSearchAdapter };
export default Project;

