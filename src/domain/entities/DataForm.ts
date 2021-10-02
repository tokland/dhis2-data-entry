import _ from "lodash";
import { Code, Id } from "./Base";
import { DataElement, DataElementId, DataElementValue, getValueFromString, ValueOf } from "./DataElement";
import { DataValue } from "./DataValue";
import { Indicator, IndicatorId } from "./Indicator";
import { applyRulesToDataForm } from "./Rule";
import { DataFormLogic } from "./DataFormLogic";
import { sortDataItems, SortingInfo } from "./DataItem";
import { OrgUnit } from "./OrgUnit";
import { Maybe } from "../../utils/ts-utils";

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
    values: Record<DataElementId, Maybe<DataElementValue>>;
    indicatorValues: Record<IndicatorId, string>;
    hidden: { indicators: Set<Code> };
    periods: string[];
    constants: Record<Code, number>;
}

export function getValue<DE extends DataElement>(dataForm: DataForm, dataElement: DE): ValueOf<DE> {
    return dataForm.values[dataElement.id] as ValueOf<DE>;
}

export function setDataValue<DE extends DataElement>(
    dataForm: DataForm,
    dataElement: DE,
    value: ValueOf<DE>
): DataForm {
    return { ...dataForm, values: { ...dataForm.values, [dataElement.id]: value } };
}

export function setDataElementValueFromString<DE extends DataElement>(
    dataForm: DataForm,
    dataElement: DE,
    strValue: string
): DataForm {
    const value = getValueFromString<DE>(dataElement, strValue);
    return setDataValue(dataForm, dataElement, value);
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

export function updateDataValuesWithoutProcessing(dataForm: DataForm, dataValues: DataValue[]): DataForm {
    const valueByDataElementId = _.keyBy(dataValues, dv => dv.dataElementId);

    const dataFormUpdated = _(dataForm.dataElements)
        .values()
        .reduce((dataFormAcc, dataElement) => {
            const dataValue = valueByDataElementId[dataElement.id];
            const baseDataElement = dataValue ? { ...dataElement, comment: dataValue.comment } : dataElement;

            if (dataValue?.value !== undefined) {
                return setDataElementValueFromString(dataFormAcc, baseDataElement, dataValue?.value);
            } else {
                return dataFormAcc;
            }
        }, dataForm);

    return dataFormUpdated;
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
