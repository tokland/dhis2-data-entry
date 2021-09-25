import _ from "lodash";
import { Code, CodedRef, Id } from "./Base";
import { DataElement, setDataElementValueFromString } from "./DataElement";
import { DataValue, DataValueWithCode, getDataValuesWithCode } from "./DataValue";
import { Indicator, IndicatorId } from "./Indicator";
import { applyRulesToDataForm } from "./Rule";
import { DataFormLogic } from "./DataFormLogic";
import { sortDataItems, SortingInfo } from "./DataItem";
import { OrgUnit } from "./OrgUnit";

// TODO: Create a DataSet that contains no values, current orgUnit, nor visibility
export interface DataForm {
    id: Id;
    name: string;
    sections: DataFormSection[];
    organisationUnits: Set<Id>;
    dataElements: Record<Id, DataElement>;
    indicators: Record<Id, Indicator>;
    logic: DataFormLogic;
    maxOrgUnitLevel: number;
    childrenOrgUnits: OrgUnit[];
    indicatorValues: Record<IndicatorId, string>;
    initialDataValues: DataValueWithCode[]; // Used in logic
    hidden: {
        indicators: Set<Code>;
    };
    periods: string[];
    constants: Record<Code, number>;
}

export interface DataFormSection {
    id: string;
    name: string;
    dataElementIds: Id[];
    indicatorIds: Id[];
    visible: boolean;
}

type DataFormAttrs = DataForm;

export function buildDataForm(dataForm: DataFormAttrs): DataForm {
    return applyRulesToDataForm(dataForm);
}

export function setDataFormDataElement(dataForm: DataForm, dataElement: DataElement): DataForm {
    return {
        ...dataForm,
        dataElements: { ...dataForm.dataElements, [dataElement.id]: dataElement },
    };
}

export function updateInitialDataValues(
    dataForm: DataForm,
    dataElements: CodedRef[],
    dataValues: DataValue[]
): DataForm {
    return { ...dataForm, initialDataValues: getDataValuesWithCode(dataElements, dataValues) };
}

export function updateDataValuesWithoutProcessing(dataForm: DataForm, dataValues: DataValue[]): DataForm {
    const valueByDataElementId = _.keyBy(dataValues, dv => dv.dataElementId);

    const dataElements = _.mapValues(dataForm.dataElements, dataElement => {
        const dataValue = valueByDataElementId[dataElement.id];
        const baseDataElement = dataValue ? { ...dataElement, comment: dataValue.comment } : dataElement;

        if (dataValue?.value !== undefined) {
            return setDataElementValueFromString(baseDataElement, dataValue?.value);
        } else {
            return baseDataElement;
        }
    });

    return { ...dataForm, dataElements };
}

export function updateDataValues(dataForm: DataForm, dataValues: DataValue[]): DataForm {
    return buildDataForm(updateDataValuesWithoutProcessing(dataForm, dataValues));
}

type DataItem = { type: "dataElement"; item: DataElement } | { type: "indicator"; item: Indicator };

export function getDataItemsForSection(dataForm: DataForm, section: DataFormSection): DataItem[] {
    const dataElements = getDataElementsForSection(dataForm, section);
    const indicators = getIndicatorsForSection(dataForm, section);

    const sortingInfo: SortingInfo = _(indicators)
        .map(indicator =>
            indicator.afterDataElement
                ? { indicatorCode: indicator.code, afterDataElementCode: indicator.afterDataElement }
                : null
        )
        .compact()
        .value();

    const dataElementItems = dataElements.map(de => ({ type: "dataElement" as const, item: de }));
    const indicatorItems = indicators.map(ind => ({ type: "indicator" as const, item: ind }));

    return sortDataItems(dataElementItems, indicatorItems, sortingInfo);
}

function getDataElementsForSection(dataForm: DataForm, section: DataFormSection): DataElement[] {
    return _(section.dataElementIds)
        .map(deId => dataForm.dataElements[deId])
        .compact()
        .value();
}

function getIndicatorsForSection(dataForm: DataForm, section: DataFormSection): Indicator[] {
    return _(section.indicatorIds)
        .map(deId => dataForm.indicators[deId])
        .compact()
        .value();
}

export function isIndicatorVisible(dataForm: DataForm, indicator: Indicator): boolean {
    return !dataForm.hidden.indicators.has(indicator.code);
}

export function isOrgUnitAssignedToDataForm(dataForm: DataForm, orgUnitId: Id) {
    return dataForm.organisationUnits.has(orgUnitId);
}
