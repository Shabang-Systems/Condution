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
    taskCollection: object[],
    projectCollection: object[],
    tagCollection: object[],
    perspectiveCollection: object[],
}

type Filterable = Task|Tag|Project|Perspective;

class Query {
    private cm: Context;

    private static taskPages:object[];
    private static projectPages:object[];
    private static perspectivePages:object[];
    private static tagPages:object[];

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
     * @static
     *
     */

    static SelfDestruct() {
        delete Query.taskPages;
        delete Query.projectPages;
        delete Query.perspectivePages;
        delete Query.tagPages;
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
        }).data();

        Query.projectPages = await this.cm.collection(["projects"], false, async () => {
            Query.projectPages = await this.cm.collection(["projects"]).data();
        }).data();

        Query.tagPages = await this.cm.collection(["tags"], false, async () => {
            Query.tagPages = await this.cm.collection(["tags"]).data();
        }).data();

        Query.perspectivePages = await this.cm.collection(["perspectives"], false, async () => {
            Query.perspectivePages = await this.cm.collection(["perspectives"]).data();
        }).data();
    }

    /**
     * Execute a filter query based on a function parameter
     *
     * @param{Function} objType    the type of object you want to filter on. Task, Project, Perspective, or Tag.
     * @param{(i:Filterable)=>boolean} condition    the condition you are filtering on
     * @param{((i:Filterable)=>boolean)[]?} conditions    a list of conditions you are filtering on
     * @returns{Promise<Filterable>}
     *
     */

    async execute(objType:Function, condition:(i:Filterable)=>boolean, conditions?:((i:Filterable)=>boolean)[]): Promise<Filterable[]> {

        console.assert(condition||conditions, "CondutionEngine: you gave .execute() a condition and multiple conditions. How the heck am I supposed to know which one to filter by? Choose one to give.");

        let data:Filterable[] = [];

        if (!Query.taskPages)
            await this.index();

        let dataObject:AdapterData = {
            taskCollection: Query.taskPages,
            projectCollection: Query.projectPages,
            tagCollection: Query.tagPages,
            perspectiveCollection: Query.perspectivePages,
        }

        let taskPages:object[] = dataObject.taskCollection;
        let projectPages:object[] = dataObject.projectCollection;
        let tagPages:object[] = dataObject.tagCollection;
        let perspectivePages:object[] = dataObject.perspectiveCollection;

        if (objType == Task) {
            data = await Promise.all(taskPages.map(async (p:object) => await TaskSearchAdapter.seed(this.cm, p["id"], dataObject)));
        } 

        if (objType == Project) {
            data = await Promise.all(projectPages.map(async (p:object) => await ProjectSearchAdapter.seed(this.cm, p["id"], dataObject)));
        }

        if (objType == Tag) {
            data = await Promise.all(tagPages.map(async (p:object) => await TagSearchAdapter.seed(this.cm, p["id"], dataObject)));
        }

        if (objType == Perspective) {
            data = await Promise.all(perspectivePages.map(async (p:object) => await PerspectiveSearchAdapter.seed(this.cm, p["id"], dataObject)));
        }

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

        return await Promise.all(data.map(async (result:TaskSearchAdapter|TagSearchAdapter|ProjectSearchAdapter|PerspectiveSearchAdapter)=>await result.produce()));
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

}


/**
 * Flush all caches, and cause everything to
 * self-destruct. Used during account switching
 * and the app's sleep time to prevent memory leak
 */

function GloballySelfDestruct() {
    Task.SelfDestruct();
    Workspace.SelfDestruct();
    Tag.SelfDestruct();
    Project.SelfDestruct();
    Query.SelfDestruct();
    Perspective.SelfDestruct();
    TODOFlushFirebaseData();
}

export { RepeatRule, RepeatRuleType, Query, GloballySelfDestruct };
export type { AdapterData, Filterable };

