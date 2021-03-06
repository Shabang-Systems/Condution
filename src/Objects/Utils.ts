enum RepeatRuleType {
    NONE = "none",
    DAY = "daily",
    WEEK = "weekly",
    MONTH = "monthly",
    YEAR = "yearly"
}

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

    static encode(repeatRule:object) {
        if (!repeatRule) 
            return null;
        let r:RepeatRule = new RepeatRule(repeatRule["rule"], repeatRule["on"]);
        return r;
    }

    //decode(): object {
    //}
}


export { RepeatRule, RepeatRuleType };

