import { RuleProperties } from "json-rules-engine";
import { EventWithIndex } from "../engine/rules-engine-types";

export interface RuleDefinition extends RuleProperties {
    event: EventWithIndex;
}
