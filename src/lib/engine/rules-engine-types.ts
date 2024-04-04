import { Rule, Event } from "json-rules-engine";

export interface IIndex {
    [x: number]: boolean;
}[]

export interface EventWithIndex extends Event {
    type: string
    params: {
        registerErrorOn?: string[]
    }
}



// export class RuleInner extends Rule {

//     // was taken from json-rules-engine\dist\rule.js line 148
//     ruleEvent!: EventWithIndex
// }