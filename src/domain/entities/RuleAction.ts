import _ from "lodash";
import { Code } from "./Base";
import { DataElement, DataElementStatus, setDataElementValueFromString } from "./DataElement";
import { DataForm, setDataFormDataElement } from "./DataForm";

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

            const updatedDataElementsById = _(dataElements)
                .map((de): DataElement => {
                    const dataFormDe = dataForm.dataElements[de.id];
                    return dataFormDe ? { ...dataFormDe, visible: isVisible } : de;
                })
                .keyBy(de => de.id)
                .value();

            const dataElementsUpdated = { ...dataForm.dataElements, ...updatedDataElementsById };

            return { ...dataForm, dataElements: dataElementsUpdated };
        }

        case "setSectionVisibility": {
            const { sectionName, isVisible } = action;
            const sectionsUpdated = dataForm.sections.map(section =>
                section.name === sectionName ? { ...section, visible: isVisible } : section
            );
            return { ...dataForm, sections: sectionsUpdated };
        }

        case "setIndicatorVisibility": {
            const { code, isVisible } = action;
            const indicators = Array.from(dataForm.hidden.indicators);
            const newIndicators = !isVisible ? indicators.concat([code]) : _.without(indicators, code);

            return { ...dataForm, hidden: { ...dataForm.hidden, indicators: new Set(newIndicators) } };
        }

        case "setDataElementValue": {
            const { dataElement, value } = action;
            const dataFormDataElement = dataForm.dataElements[dataElement.id];
            return dataFormDataElement
                ? setDataFormDataElement(dataForm, setDataElementValueFromString(dataFormDataElement, value))
                : dataForm;
        }

        case "setDataElementEditable": {
            const { dataElement, isEditable, disabledReason } = action;
            const dataFormDataElement = dataForm.dataElements[dataElement.id];
            const newStatus: DataElementStatus = isEditable
                ? { type: "enabled" }
                : { type: "disabled", reason: disabledReason };
            return dataFormDataElement
                ? setDataFormDataElement(dataForm, { ...dataFormDataElement, status: newStatus })
                : dataForm;
        }
    }
}

export function applyActions(dataForm: DataForm, actions: RuleAction[]): DataForm {
    return actions.reduce(runAction, dataForm);
}
