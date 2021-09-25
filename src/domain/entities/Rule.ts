import _ from "lodash";
import { Maybe } from "../../utils/ts-utils";
import { DataElement, DataElementId } from "./DataElement";
import { DataForm } from "./DataForm";
import { DataFormLogic } from "./DataFormLogic";
import { DataValueWithCode } from "./DataValue";
import { applyActions, RuleAction } from "./RuleAction";

export type Namespace<DEKey extends string> = Record<DEKey, DataElementId>;

export const emptyRuleCollection: DataFormLogic = {
    entities: { dataElements: {} },
    rules: [],
    validations: [],
};

export interface RuleData<DEKey extends string = string> {
    dataForm: DataForm;
    dataElements: Record<DEKey, DataElement>;
    initialDataValues: DataValueWithCode[];
}

export interface Rule<DEKey extends string> {
    actions(data: RuleData<DEKey>): Maybe<RuleAction>[];
}

export function rule<DEKey extends string>(ruleAttributes: Rule<DEKey>): Rule<DEKey> {
    return ruleAttributes;
}

export function getDataElementsFromDataForm(dataForm: DataForm): Record<string, DataElement> {
    const { entities } = dataForm.logic;
    const { dataElements: dataElementsCodeByKey } = entities;

    const dataElementsByCode = _(dataForm.dataElements)
        .values()
        .map(dataElement => [dataElement.code, dataElement] as [string, DataElement])
        .fromPairs()
        .value();

    const dataElements = _(dataElementsCodeByKey)
        .toPairs()
        .map(([key, code]) => {
            const dataElement = dataElementsByCode[code];
            if (!dataElement) {
                console.error(`Data element not found in dataSet ${dataForm.id}: ${code}`);
                return null;
            } else {
                return [key, dataElement] as [typeof key, typeof dataElement];
            }
        })
        .compact()
        .fromPairs()
        .value();

    return dataElements;
}

export function applyRulesToDataForm(dataForm: DataForm): DataForm {
    return dataForm.logic.rules.reduce((currentDataForm, rule) => {
        const dataElements = getDataElementsFromDataForm(currentDataForm);

        const ruleData: RuleData = {
            dataForm,
            dataElements,
            initialDataValues: dataForm.initialDataValues,
        };

        const actions = rule.actions(ruleData);

        return applyActions(currentDataForm, _.compact(actions));
    }, dataForm);
}
