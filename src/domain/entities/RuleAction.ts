import _ from "lodash";
import { Code } from "./Base";
import { DataElement } from "./DataElement";
import {
    DataForm,
    setDataElementVisibility,
    setDataElementValueFromString,
    enableDataElement,
    disableDataElement,
} from "./DataForm";

// TODO: setSectionVisibility sectionName -> Section
export type RuleAction =
    | { type: "setDataElementsVisibility"; dataElements: DataElement[]; isVisible: boolean }
    | { type: "setIndicatorVisibility"; code: Code; isVisible: boolean }
    | { type: "setSectionVisibility"; sectionName: string; isVisible: boolean }
    | { type: "setDataElementValue"; dataElement: DataElement; value: string }
    | {
          type: "setDataElementEditable";
          dataElement: DataElement;
          isEditable: boolean;
          disabledReason: string;
      };

export function runAction(dataForm: DataForm, action: RuleAction): DataForm {
    switch (action.type) {
        case "setDataElementsVisibility": {
            const { dataElements, isVisible } = action;

            return dataElements.reduce((dataFormAcc, dataElement) => {
                return setDataElementVisibility(dataFormAcc, dataElement, isVisible);
            }, dataForm);
        }

        case "setSectionVisibility": {
            const { sectionName, isVisible } = action;
            const sectionsUpdated = dataForm.dataSet.sections.map(section =>
                section.name === sectionName ? { ...section, visible: isVisible } : section
            );
            return { ...dataForm, dataSet: { ...dataForm.dataSet, sections: sectionsUpdated } };
        }

        case "setIndicatorVisibility": {
            const { code, isVisible } = action;
            const indicators = Array.from(dataForm.hidden.indicators);
            const newIndicators = !isVisible ? indicators.concat([code]) : _.without(indicators, code);

            return { ...dataForm, hidden: { ...dataForm.hidden, indicators: new Set(newIndicators) } };
        }

        case "setDataElementValue": {
            const { dataElement, value } = action;
            const dataFormDataElement = dataForm.dataSet.dataElements[dataElement.id];
            return dataFormDataElement
                ? setDataElementValueFromString(dataForm, dataFormDataElement, value)
                : dataForm;
        }

        case "setDataElementEditable": {
            const { dataElement, isEditable, disabledReason } = action;
            return isEditable
                ? enableDataElement(dataForm, dataElement)
                : disableDataElement(dataForm, dataElement, disabledReason);
        }
    }
}

export function applyActions(dataForm: DataForm, actions: RuleAction[]): DataForm {
    return actions.reduce(runAction, dataForm);
}
