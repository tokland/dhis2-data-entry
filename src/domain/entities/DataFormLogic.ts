import { FormValidation } from "./rules/FormValidation";
import { Rule } from "./Rule";
import { Id } from "./Base";
import { Config } from "./Config";
import { DataForm } from "./DataForm";
import { DataElement } from "./DataElement";

export interface DataFormLogic<DEKey extends string = string> {
    entities: { dataElements: Record<DEKey, string> };
    rules: Rule<DEKey>[];
    validations: FormValidation[];
    getInitialDataValues?(options: { config: Config; orgUnitPath: Id[] }): InitialDataValues;
    processDataFormsAfterSave?(options: ProcessDataFormsAfterSaveOptions): {
        dataForms: DataForm[];
    };
}

interface ProcessDataFormsAfterSaveOptions {
    config: Config;
    orgUnitPath: Id[];
    dataElement: DataElement;
    period: string;
}

type InitialDataValues = Array<{ dataSetId: Id; orgUnitId: Id }>;
