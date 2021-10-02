import { FormValidation } from "./rules/FormValidation";
import { Rule } from "./Rule";

export interface DataFormLogic<DEKey extends string = string> {
    entities: { dataElements: Record<DEKey, string> };
    rules: Rule<DEKey>[];
    validations: FormValidation[];
}
