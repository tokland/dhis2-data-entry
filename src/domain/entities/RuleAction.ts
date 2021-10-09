import { DataElement } from "./DataElement";
import {
    DataForm,
    setDataElementVisibility,
    setDataElementValueFromString,
    enableDataElement,
    disableDataElement,
    setIndicatorVisibility,
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
            const sectionsUpdated = dataForm.dataSet.sections.map(section =>
                section.name === sectionName ? { ...section, visible: isVisible } : section
            );
            return { ...dataForm, dataSet: { ...dataForm.dataSet, sections: sectionsUpdated } };
        }

        case "setIndicatorVisibility": {
            const { indicator, isVisible } = action;
            return setIndicatorVisibility(dataForm, indicator, isVisible);
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
