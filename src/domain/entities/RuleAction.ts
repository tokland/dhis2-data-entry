import { DataElement } from "./DataElement";
import {
    DataForm,
    setDataElementVisibility,
    setDataElementValueFromString,
    enableDataElement,
    disableDataElement,
    setIndicatorVisibility,
    setSectionVisibility,
} from "./DataForm";
import { Indicator } from "./Indicator";

// TODO: setSectionVisibility sectionName -> Section
export type RuleAction =
    | { type: "setDataElementsVisibility"; dataElement: DataElement; isVisible: boolean }
    | { type: "setIndicatorVisibility"; indicator: Indicator; isVisible: boolean }
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
            const { dataElement, isVisible } = action;
            return setDataElementVisibility(dataForm, dataElement, isVisible);
        }

        case "setSectionVisibility": {
            const { sectionName, isVisible } = action;
            const section = dataForm.dataSet.sections.find(section => section.name === sectionName);
            if (section) {
                return setSectionVisibility(dataForm, section, isVisible);
            } else {
                console.error(`Section not found: name=${sectionName}`);
                return dataForm;
            }
        }

        case "setIndicatorVisibility": {
            const { indicator, isVisible } = action;
            return setIndicatorVisibility(dataForm, indicator, isVisible);
        }

        case "setDataElementValue": {
            const { dataElement, value } = action;
            return setDataElementValueFromString(dataForm, dataElement, value);
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
