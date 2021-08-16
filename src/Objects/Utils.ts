import * as chrono from 'chrono-node';

import Tag, { TagSearchAdapter } from "./Tag";
import Task, { TaskSearchAdapter } from "./Task";
import Project, { ProjectSearchAdapter } from "./Project";
import Perspective, { PerspectiveSearchAdapter } from "./Perspective";
import Workspace from "./Workspace";
import { Context } from "./EngineManager";
import { TODOFlushFirebaseData } from "../Storage/Backends/FirebaseBackend";


enum RepeatRuleType {
    NONE = "none",
    DAY = "daily",
    WEEK = "weekly",
    QUARTER = "quarterly",
    MONTH = "monthly",
    YEAR = "yearly"
}

const ONEDAY = 24 * 60 * 60 * 1000;

// Let us fix jemoka's old, bad programming! 
// Unfortunately, there is no way for us to go back in time
// to ret-con the mistakes, because..... sigh..............
// no database migrations are allowed.
//
// Object access, however, is O(1), so this _should_? 
// be fine b/c is just doing one hash looku.
//

const WEEKDAYDECODE = {"M": 1, "T": 2, "W": 3, "Th": 4, "F": 5, "S": 6, "Su": 7};


class RepeatRule {
    ruleType: RepeatRuleType; 
    constraints: string[];

    constructor(type: RepeatRuleType, constraints?: string[]) {
        this.ruleType = type;
        if (constraints)
            this.constraints = constraints;
        else
            this.constraints = null;
    }

    /**
     * Encode database object to RepeatRule
     * @static
     *
     * @param{object} repeatRule    the repeat rule object from the database
     * @returns{RepeatRule} the repeat rule you wanted
     *
     */

    static encode(repeatRule:object): RepeatRule {
        if (!repeatRule) 
            return null;
        let r:RepeatRule = new RepeatRule(repeatRule["rule"], repeatRule["on"]);
        return r;
    }

    /**
     * Execute a repeat date calculation, weekly
     * @private
     *
     * @param{Date} date    the task's due date
     * @returns{number} how many days later the task should be due again.
     * 
     */

    private calculateRepeat_weekly(date:Date) : number {
        let dayOfWeek : number = date.getDay();
        if (this.constraints) {
            let minNext : number = 7;
            this.constraints.forEach((val:string) => { // calculate all possible next day constraints. Get minimum
                let constraintVal : number = WEEKDAYDECODE[val]; // decode weekday name value to a date number
                minNext = Math.min(minNext, constraintVal > dayOfWeek ? // if constraint value is higher than the current day...
                    constraintVal-dayOfWeek :  // just get the difference.
                    (7-dayOfWeek)+constraintVal); // if not, get the next time that day comes up in 1 week
            });
            return minNext;
        } else return 7;
    }

    /**
     * Execute a repeat date calculation, monthly
     * @private
     *
     * @param{Date} date    the task's due date
     * @returns{number} how many days later the task should be due again.
     * 
     */

    private calculateRepeat_monthly(date:Date) : number {
        let dayOfMonth : number = date.getDate();
        if (this.constraints) {
            let minNext : number = 32;
            this.constraints.forEach((val:string) => { // calculate all possible next day constraints. Get minimum
                let daysUntilLast : number = (new Date(
                        date.getFullYear(), 
                        date.getMonth()+1, 
                        0 // get zeroeth day of next month
                        // so. like. the last day of this month
                    ).getDate() - date.getDate())
                if (val == "last")
                    minNext = Math.min(minNext, daysUntilLast); // if last is an option, ig just return days until last
                else { 
                    let constraintVal:number = Number(val); // cast the stupid string to an int
                    minNext = Math.min(minNext, constraintVal > dayOfMonth ? // if constraint value is higher than the current day...
                        constraintVal-dayOfMonth :  // just get the difference.
                        (daysUntilLast)+constraintVal); // if not, get the next time that day comes up in 1 week
                }
            });
            return minNext;
        } else {
            return Math.round((new Date(
                date.getFullYear(), 
                date.getMonth()+1, 
                date.getDate()
            ).getTime() - date.getTime())/(ONEDAY))
        }
    }

    /**
     * Execute a repeat date calculation, quarterly
     * @private
     *
     * @param{Date} date    the task's due date
     * @returns{number} how many days later the task should be due again.
     * 
     */

    private calculateRepeat_quarterly(date:Date) : number {
        return Math.round((new Date(
            date.getFullYear(), 
            date.getMonth()+3, 
            date.getDate()
        ).getTime() - date.getTime())/(ONEDAY))
    }

    /**
     * Execute a repeat date calculation, yearly
     * @private
     *
     * @param{Date} date    the task's due date
     * @returns{number} how many days later the task should be due again.
     * 
     */

    private calculateRepeat_yearly(date:Date) : number {
        return Math.round((new Date(
            date.getFullYear()+1, 
            date.getMonth(), 
            date.getDate()
        ).getTime() - date.getTime())/(ONEDAY))
    }

    /**
     * Execute a repeat date calculation based on the repeat rule
     *
     * @param{Date} due    the task's original due date
     * @param{Date=} defer    the task's original defer date
     * @returns{Date[]} the calculated new due, defer pair. If no defer supplied, the latter will be null.
     * 
     */

    execute(due:Date, defer?:Date): Date[] {
        let increment:number = 0;
        switch (this.ruleType) {
            case RepeatRuleType.DAY: {
                increment = 1;
                break;
            }
            case RepeatRuleType.WEEK: {
                increment = this.calculateRepeat_weekly(due);
                break;
            }
            case RepeatRuleType.MONTH: {
                increment = this.calculateRepeat_monthly(due);
                break;
            }
            case RepeatRuleType.QUARTER: {
                increment = this.calculateRepeat_quarterly(due);
                break;
            }
            case RepeatRuleType.YEAR: {
                increment = this.calculateRepeat_yearly(due);
                break;
            }
        }
        due.setDate(due.getDate()+increment);
        if (defer) {
            defer.setDate(defer.getDate()+increment);
        }
        return [due, defer?defer:null];
    }

    /**
     * Is the repeat rule repeating?
     * @property
     * 
     */

    get isRepeating() {
        return this.ruleType !== RepeatRuleType.NONE;
    }

    /**
     * Decode the repeating rule to database object
     *
     * @returns{object} the desired database object
     * 
     */

    decode(): object {
        return Object.assign({rule: this.ruleType}, this.constraints ? {on: this.constraints}:{})
    }
}

interface AdapterData {
    taskMap: object,
    projectMap: object,
    tagMap: object,
    perspectiveMap: object,
}

//type TP = Task[] | Project[]
//type Filterable = Task|Tag|Project|Perspective|(Promise<(Task | Project)[][]>);
type Filterable = Task|Tag|Project|Perspective|(Task | Project)[];

class Query {
    cm: Context;
    private static hasIndexed:boolean = false;

    private static taskPages:object[];
    private static projectPages:object[];
    private static perspectivePages:object[];
    private static tagPages:object[];

    private static taskAdapters:TaskSearchAdapter[];
    private static projectAdapters:ProjectSearchAdapter[];
    private static perspectiveAdapters:PerspectiveSearchAdapter[];
    private static tagAdapters:TagSearchAdapter[];

    private static taskMap:object = {};
    private static projectMap:object = {};
    private static tagMap:object = {};
    private static perspectiveMap:object = {};

    private adapterSeedPromise:Promise<void> = null;
    private static queryIndexPromise:Promise<void> = null;


    // TODO SHIELD YOUR EYES!!!! Incoming language abuse 😱 
    // ok look. I know. This should be a template function.
    // But! The lack of std::is_same makes it rather difficult
    // to actually know what type T is because somehow checking
    // if two types are the same is a difficult proposition in
    // the 21st century where blackmagic runs wild in the streets.
    // 
    // So, I pray thee, ask Microsoft for a type equality operator
    // overload on Typescript types. And while you are at it ask
    // Microsoft to make Windows better.

    constructor(context:Context) {
        this.cm = context;
    }


    /**
     * Nuke the cache
     * @static @async
     *
     */

    static async SelfDestruct() {
        delete Query.taskPages;
        delete Query.projectPages;
        delete Query.perspectivePages;
        delete Query.tagPages;

        delete Query.taskMap;
        delete Query.projectMap;
        delete Query.tagMap;
        delete Query.perspectiveMap;

        Query.hasIndexed = false;

        Query.taskMap = {};
        Query.projectMap = {};
        Query.tagMap = {};
        Query.perspectiveMap = {};
        Hookifier.call(`QueryEngine`);
    }

    /**
     * Index the database so that... we have something to filter.
     * @async
     *
     * You should probably call this before you execute.
     *
     * @returns {Promise<void>}
     *
     */

    async index() : Promise<void> {
        Query.taskPages = await this.cm.collection(["tasks"], false, async () => {
            Query.taskPages = await this.cm.collection(["tasks"]).data();
            Query.taskPages.map((i:object) => Query.taskMap[i["id"]] = i);
            if (Query.hasIndexed && !Hookifier.getFrozen()) {
                await this.seedAdapters();
                Hookifier.call(`QueryEngine`);
            } else if (Hookifier.getFrozen()){
                this.seedAdapters();
            }
        }).data();

        Query.taskPages.map((i:object) => Query.taskMap[i["id"]] = i);

        Query.projectPages = await this.cm.collection(["projects"], false, async () => {
            Query.projectPages = await this.cm.collection(["projects"]).data();
            Query.projectPages.map((i:object) => Query.projectMap[i["id"]] = i);
            if (Query.hasIndexed && !Hookifier.getFrozen()) {
                await this.seedAdapters();
                Hookifier.call(`QueryEngine`);
            } else if (Hookifier.getFrozen()){
                this.seedAdapters();
            }
        }).data();
        Query.projectPages.map((i:object) => Query.projectMap[i["id"]] = i);

        Query.tagPages = await this.cm.collection(["tags"], false, async () => {
            Query.tagPages = await this.cm.collection(["tags"]).data();
            Query.tagPages.map((i:object) => Query.tagMap[i["id"]] = i);

            if (Query.hasIndexed && !Hookifier.getFrozen()) {
                await this.seedAdapters();
                Hookifier.call(`QueryEngine`);
            } else if (Hookifier.getFrozen()){
                this.seedAdapters();
            }
        }).data();
        Query.tagPages.map((i:object) => Query.tagMap[i["id"]] = i);

        Query.perspectivePages = await this.cm.collection(["perspectives"], false, async () => {
            Query.perspectivePages = await this.cm.collection(["perspectives"]).data();
            Query.perspectivePages.map((i:object) => Query.perspectiveMap[i["id"]] = i);

            if (Query.hasIndexed && !Hookifier.getFrozen()) {
                await this.seedAdapters();
                Hookifier.call(`QueryEngine`);
            } else if (Hookifier.getFrozen()){
                this.seedAdapters();
            }
        }).data();
        Query.perspectivePages.map((i:object) => Query.perspectiveMap[i["id"]] = i);
        await this.seedAdapters();

        Query.hasIndexed = true;
    }

    /**
     * Reseed all the adapters
     */

    private seedAdapters = async () => {
        if (this.adapterSeedPromise)
            return await this.adapterSeedPromise;

        this.adapterSeedPromise = new Promise(async (res, _) => {
            let dataObject:AdapterData = {
                taskMap: Query.taskMap,
                projectMap: Query.projectMap,
                tagMap: Query.tagMap,
                perspectiveMap: Query.perspectiveMap
            }

            let taskPages:object[] = Query.taskPages;
            let projectPages:object[] = Query.projectPages;
            let tagPages:object[] = Query.tagPages;
            let perspectivePages:object[] = Query.perspectivePages;

            Query.taskAdapters = await Promise.all(taskPages.map(async (p:object) => await TaskSearchAdapter.seed(this.cm, p["id"], dataObject)));

            Query.projectAdapters = await Promise.all(projectPages.map(async (p:object) => await ProjectSearchAdapter.seed(this.cm, p["id"], dataObject)));

            Query.tagAdapters = await Promise.all(tagPages.map(async (p:object) => await TagSearchAdapter.seed(this.cm, p["id"], dataObject)));

            Query.perspectiveAdapters = await Promise.all(perspectivePages.map(async (p:object) => await PerspectiveSearchAdapter.seed(this.cm, p["id"], dataObject)));

            res();
        });

        await this.adapterSeedPromise;
        this.adapterSeedPromise = null;
    }

    
    /**
     * Hook a callback to whence this Query updates
     * @static
     *
     * @param{Function} hookFn    the function you want to hook in
     * @returns{void}
     *
     */

    static hook(hookFn: Function): void {
        Hookifier.push(`QueryEngine`, hookFn);
    }

    /**
     * Unook a hooked callback to whence this Query updates
     * @static
     *
     * @param{Function} hookFn    the function you want to unhook
     * @returns{void}
     *
     */

    static unhook(hookFn: Function): void {
        Hookifier.remove(`QueryEngine`, hookFn);
    }

    /**
     * Semi-internal function to order a set of static data
     * @async
     *
     * Because hitting the database per page is hard, Tasks
     * especially have a special way of lazy loading whereby
     * their actual underlying data is not loaded until 
     * strictly necessary.
     *
     * but! For things like weights to work, all tasks must need
     * to be loaded. So we return a copy of the static data to seed
     * those tasks.
     */

    async orderStaticData(): Promise<AdapterData> {
        if (!Query.hasIndexed)
            await this.index();

        let dataObject:AdapterData = {
            taskMap: Query.taskMap,
            projectMap: Query.projectMap,
            tagMap: Query.tagMap,
            perspectiveMap: Query.perspectiveMap
        }

        return dataObject;
    }

    /**
     * Execute a filter query based on a function parameter
     *
     * @param{Function} objType    the type of object you want to filter on. Task, Project, Perspective, or Tag.
     * @param{(i:Filterable)=>boolean} condition    the condition you are filtering on
     * @param{((i:Filterable)=>boolean)[]?} conditions    a list of conditions you are filtering on
     * @param{boolean} returnLiveObjects    default true. Optionally False to return readonly "ghost" objects to save memory during indexing
     * @returns{Promise<Filterable>}
     *
     */

    async execute(objType:Function, condition:(i:Filterable)=>boolean, conditions?:((i:Filterable)=>boolean)[], returnLiveObjects:boolean=true): Promise<Filterable[]> {
        console.assert(condition||conditions, "CondutionEngine: you gave .execute() a condition and multiple conditions. How the heck am I supposed to know which one to filter by? Choose one to give.");

        if (!Query.queryIndexPromise !== Query.hasIndexed)
            Query.queryIndexPromise = this.index();

        await Query.queryIndexPromise;
        Query.queryIndexPromise = null;

        let data:Filterable[] = [];

        //let taskPages:object[] = dataObject.taskCollection;
        //let projectPages:object[] = dataObject.projectCollection;
        //let tagPages:object[] = dataObject.tagCollection;
        //let perspectivePages:object[] = dataObject.perspectiveCollection;

        if (objType == Task) 
            data = Query.taskAdapters;
        if (objType == Project)
            data = Query.projectAdapters;
        if (objType == Tag)
            data = Query.tagAdapters;
        if (objType == Perspective)
            data = Query.perspectiveAdapters;

        TagSearchAdapter.cleanup();
        TaskSearchAdapter.cleanup();
        ProjectSearchAdapter.cleanup();
        PerspectiveSearchAdapter.cleanup();

        if (condition)
            data = data.filter(condition)
        else {
            conditions.forEach((query:((i:Filterable)=>boolean)) => {
                data = data.filter(query);
            });
        }

        if (returnLiveObjects) {
            let results:Filterable[] = await Promise.all(data.map(async (result:TaskSearchAdapter|TagSearchAdapter|ProjectSearchAdapter|PerspectiveSearchAdapter)=>await result.produce()));

            // filter+return for any non-existant objects/dead pointers
            return results.filter((i:Filterable) => i !== null);
        } else return data;
    }

   /**
     * Execute a filter query based a bunch of function parametetrs
     *
     * @param{Function} objType    the type of object you want to filter on. Task, Project, or Tag.
     * @param{((i:Filterable)=>boolean)[]} conditions    a list of conditions you are filtering on
     * @returns{Promise<Filterable>}
     *
     */

    async batch_execute(objType:Function, conditions:((i:Filterable)=>boolean)[]): Promise<Filterable[]> {
        return await this.execute(objType, null, conditions);
    };


    /**
     * Trigger all hooks
     * @static
     *
     * @returns{void}
     */

    static triggerHooks(): void {
        Hookifier.call(`QueryEngine`);
    }
}

class Hookifier {
    private static hooks: Map<string, Set<Function>> = new Map<string, Set<Function>>();
    private static pendingCalls: Map<string, ReturnType<typeof setTimeout>> = new Map<string, ReturnType<typeof setTimeout>>();
    private static _frozen:boolean = false;
    private static lastFreeze:Date = new Date();
    private static freezeStack:Set<string> = new Set<string>();

    /**
     * Nuke
     * @static
     *
     * @returns{void}
     */

    static SelfDestruct():void {
        Hookifier._frozen = false;
        Hookifier.lastFreeze = new Date();
        Hookifier.freezeStack = new Set<string>();

        Hookifier.hooks = new Map<string, Set<Function>>();
        Hookifier.pendingCalls.forEach((val:ReturnType<typeof setTimeout>) => clearTimeout(val));
        Hookifier.pendingCalls = new Map<string, ReturnType<typeof setTimeout>>();
    }

    /**
     * Freeze all hooks
     * @static
     *
     * @returns{void}
     */

    static freeze(): void {
        Hookifier._frozen = true;
        Hookifier.lastFreeze = new Date();
        console.log("FREEZE!!");
    }

    /**
     * Unfreeze all hooks
     * @static
     *
     * @returns{void}
     */

    static unfreeze(): void {
        if (((new Date).getTime() - Hookifier.lastFreeze.getTime()) < 500) 
            return;
        Hookifier._frozen = false;
        Hookifier.freezeStack.forEach((i:string) => Hookifier.call(i));
        Hookifier.freezeStack = new Set<string>();
        Hookifier.call(`QueryEngine`);
        console.log("UNFREEZE!!");
    }

    /**
     * Get whether or not the hook is frozen
     */

    static getFrozen():boolean {
        return Hookifier._frozen;
    }

    /**
     * Push a hook onto the ledger
     *
     * @param{string} id     the id of the hook collection
     * @param{Function} fn     the hook function to run 
     * @returns{void}
     */

    static push(id:string, fn:Function): void {
        if (!Hookifier.hooks.has(id))
            Hookifier.hooks.set(id, new Set<Function>());
        let hooks:Set<Function> = Hookifier.hooks.get(id);
        hooks.add(fn);
        Hookifier.hooks.set(id, hooks);
    }

    /**
     * Remove a hook onto the ledger
     *
     * @param{string} id     the id of the hook collection
     * @param{Function} fn     the hook function to run 
     * @returns{void}
     */

    static remove(id:string, fn:Function): void {
        let hooks:Set<Function> = Hookifier.hooks.get(id);
        if (hooks) {
            hooks.delete(fn);
            Hookifier.hooks.set(id, hooks);
        }
    }

    /**
     * Gracefully call hook collection
     *
     * @param{string} id    the id of the hook collection
     * @param{number?} timeout    the buffer time for hook call
     * @returns{void}
     */

    static call(id:string, timeout:number=100): void {
        //console.log(`Call requested for ${id}`);
        // If we have a previous call OR there was recently a call
        if (Hookifier.pendingCalls.has(id)) {
            //console.log(`Previous call rejected for ${id}`);
            clearTimeout(Hookifier.pendingCalls.get(id));
        }

        Hookifier.pendingCalls.set(id, setTimeout(()=>{
            if (!Hookifier.hooks.has(id)) return;
            if (Hookifier._frozen) {
                Hookifier.freezeStack.add(id); return;
            }

            //console.log(`Calling hooks for ${id}!`);
            let hooks:Set<Function> = Hookifier.hooks.get(id);
            hooks.forEach((i:Function)=>i(id));
        }, timeout));
    }


    /**
     * Call hook collection right this second
     *
     * @param{string} id    the id of the hook collection
     * @param{number?} timeout    the buffer time for hook call
     * @returns{void}
     */

    static rude_call(id:string): void {
        if (Hookifier._frozen) {
            Hookifier.freezeStack.add(id); return;
        }
        let hooks:Set<Function> = Hookifier.hooks.get(id);
        hooks.forEach((i:Function)=>i());
    }
}

class Ticket {
    //private objPromise: Promise<Project|Task|Tag>;
    private objType: Function;
    private cm: Context;
    private _id: string;

    /**
     * A database ticket
     *
     * @param{Function} objType    object type Task|Project|Tag
     * @param{Context} cm    the context
     * @param{string} id    the ID of the object
     */

    constructor(objType:Function, cm:Context, id:string) {
        this._id = id;
        this.objType = objType;
        this.cm = cm;
    }

    /**
     * The ID of the object
     * @property
     *
     * @returns{string}
     */

    get id():string {
        return this._id;
    }

    /**
     * Return the fetched object
     *
     * @returns{Promise<Project|Task|Tag>}
     */

    async fetch():Promise<Project|Task|Tag> {
        if (this.objType === Task) 
            return Task.fetch(this.cm, this._id);
        else if (this.objType === Project)
            return Project.fetch(this.cm, this._id);
        else if (this.objType === Tag)
            return Tag.fetch(this.cm, this._id);
    }
}

/**
 * Flush all caches, and cause everything to
 * self-destruct. Used during account switching
 * and the app's sleep time to prevent memory leak
 *
 * The order here _does_ matter!
 */

function GloballySelfDestruct() {
    TODOFlushFirebaseData();
    Task.SelfDestruct();
    Workspace.SelfDestruct();
    Tag.SelfDestruct();
    Project.SelfDestruct();
    Perspective.SelfDestruct();
    Query.SelfDestruct();
}

async function BootstrapCondution(context:Context, username:string, payload:string) {
    // create 3 new tasks and set their descriptions
    (await Task.create(context, payload[0] + ` ${username}, ` + payload[1])).description = payload[2];
    (await Task.create(context, payload[3])).description = payload[4];
    (await Task.create(context, payload[5])).description = payload[6];

    let cdyrslf = await Project.create(context, payload[7]);
    let npd = await Project.create(context, payload[8]);

    let od = new Date();
    let ds = new Date();
    od.setHours(od.getHours() - 24);
    ds.setHours(ds.getHours() + 20);

    let odid = await Task.create(context, payload[9], npd, [], od);
    odid.description = payload[10];
    await npd.associate(odid); // I believe (hope) this is the equivalent to: await associateTask(userID, odid, npd);

    let dsID = await Task.create(context, payload[11], npd, [], ds);
    dsID.description = payload[12];
    await npd.associate(dsID);

    ds.setHours(ds.getHours() + 2);
    let checkoutID = await Task.create(context, payload[13]);
    checkoutID.description = payload[14];

    // I did not choose these variable names, I am just using the ones from the old onboarding code
    let nice = await Task.create(context, payload[15], cdyrslf);
    await cdyrslf.associate(nice);

    let sequential = await Task.create(context, payload[16], cdyrslf);
    sequential.description = payload[17];
    await cdyrslf.associate(sequential);

    let blocked = await Task.create(context, payload[18], cdyrslf);
    blocked.description = payload[19];
    await cdyrslf.associate(blocked);

    let click = await Task.create(context, payload[20], cdyrslf);
    click.description = payload[21];
    await cdyrslf.associate(click);

    let pspDir = await Task.create(context, payload[22], cdyrslf);
    pspDir.description = payload[23];
    await cdyrslf.associate(pspDir);

    let pspsp = await Project.create(context, payload[24]);

    let tags: Tag[] = await Promise.all([
        Tag.create(context, payload[25]),
        Tag.create(context, payload[26]),
        Tag.create(context, payload[27]),
        Tag.create(context, payload[28])
    ]);

    let specific = await Task.create(context, payload[29], pspsp, [tags[2], tags[3]]);
    await pspsp.associate(specific);

    let sp = await Task.create(context, payload[31], pspsp, [tags[0]]);
    sp.description = payload[32];
    await pspsp.associate(sp);

    await Perspective.create(context, payload[33], payload[34]);
    
    let promotion = await Project.create(context, payload[35]);

    let online = await Task.create(context, payload[36], promotion);
    await promotion.associate(online);

    let dis = await Task.create(context, payload[37], promotion);
    await promotion.associate(dis);

    let patreon = await Task.create(context, payload[38], promotion);
    await promotion.associate(patreon);

    let yiipee = await Task.create(context, payload[39], promotion);
    yiipee.description = payload[40];
    await promotion.associate(yiipee);
}

async function ParseABTIBIntention(context:Context, intention:string) {
    const ABTIB_PROJECT_PATTERN = /for (.+)$/;

    let dateInfo = chrono.parse(intention);
    let due = undefined;
    let defer = undefined;
    if (dateInfo.length > 0) {
        // we got a date!
        if (dateInfo[0].end) {
            // both start (defer) and end (due)
            // get end (due) date
            due = dateInfo[0].end.date();
            defer = dateInfo[0].start.date();
            // strip the due date string
            intention = intention.replace(dateInfo[0].text, "").trim();
        }
        else {
            // only start (due)
            due = dateInfo[0].start.date();
            // strip the due date string
            intention = intention.replace(dateInfo[0].text, "").trim();
        }
    }
    // see if the intention has a project specifier
    const project = await (async () => {
        const proj_matches = intention.trim().match(ABTIB_PROJECT_PATTERN);
        if (proj_matches === null) return undefined;
        const name = proj_matches[1];
        const projs = await (new Query(context)).execute(
            Project,
            (proj: Project) => !proj.isComplete,
        ) as Project[];
        const matches = projs.filter(p => p.name === name);
        if (matches.length === 1) {
            intention = intention.replace(ABTIB_PROJECT_PATTERN, '').trim();
            return matches[0];
        }
    })();
    return Task.create(
        context, intention, project, undefined, due, defer
    );
}

export { RepeatRule, RepeatRuleType, Query, GloballySelfDestruct, Ticket, Hookifier, BootstrapCondution, ParseABTIBIntention };
export type { AdapterData, Filterable };

