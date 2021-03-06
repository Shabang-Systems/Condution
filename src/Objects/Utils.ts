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

    get isRepeating() {
        return this.ruleType !== RepeatRuleType.NONE;
    }

    decode(): object {
        return Object.assign({rule: this.ruleType}, this.constraints ? {on: this.constraints}:{})
    }
}


export { RepeatRule, RepeatRuleType };

