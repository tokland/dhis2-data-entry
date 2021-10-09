import _ from "lodash";
import { Code, Id } from "./Base";
import { DataElement, DataElementId, DataElementValue, getValueFromString, ValueOf } from "./DataElement";
import { DataValue } from "./DataValue";
import { Indicator, IndicatorId } from "./Indicator";
import { applyRulesToDataForm } from "./Rule";
import { sortDataItems, SortingInfo } from "./DataItem";
import { Maybe } from "../../utils/ts-utils";
import { DataSet, DataSetSection, DataSetSectionId } from "./DataSet";

export interface DataForm {
    dataSet: DataSet;
    period: string;
    orgUnit: DataFormOrgUnit;
    values: Record<DataElementId, Maybe<DataElementValue>>;
    comments: Record<DataElementId, Maybe<string>>;
    dataElementsStatus: Record<DataElementId, DataElementStatus>;
    indicatorValues: Record<IndicatorId, string>;
    indicatorsStatus: Record<IndicatorId, IndicatorStatus>;
    sectionsStatus: Record<DataSetSectionId, SectionStatus>;
    constants: Record<Code, number>;
}

interface DataFormOrgUnit {
    id: Id;
    path: Id[];
}

export interface DataElementStatus {
    visible: boolean;
    enabled: DataElementEnabledStatus;
}

export interface IndicatorStatus {
    visible: boolean;
}

export interface SectionStatus {
    visible: boolean;
}

export function getDataFormId(dataForm: DataForm): string {
    return [dataForm.dataSet.id, dataForm.period, dataForm.orgUnit.id].join("-");
}

export function isSectionVisible(dataForm: DataForm, section: DataSetSection): boolean {
    const status = dataForm.sectionsStatus[section.id] || defaultSectionStatus;
    return status.visible;
}

export function setSectionVisibility(
    dataForm: DataForm,
    section: DataSetSection,
    isVisible: boolean
): DataForm {
    const prevStatus = dataForm.sectionsStatus[section.id];
    const newStatus: SectionStatus = { ...defaultSectionStatus, ...prevStatus, visible: isVisible };
    const sectionsStatus = { ...dataForm.sectionsStatus, [section.id]: newStatus };
    return { ...dataForm, sectionsStatus };
}

const defaultDataElementStatus: DataElementStatus = { visible: true, enabled: { type: "enabled" } };
const defaultIndicatorStatus: IndicatorStatus = { visible: true };
const defaultSectionStatus: SectionStatus = { visible: true };

export type DataElementEnabledStatus = { type: "enabled" } | { type: "disabled"; reason: string };

export function isDataElementVisible(dataForm: DataForm, dataElement: DataElement): boolean {
    return getDataElementStatus(dataForm, dataElement).visible;
}

export function getDataElementStatus(dataForm: DataForm, dataElement: DataElement): DataElementStatus {
    return dataForm.dataElementsStatus[dataElement.id] || defaultDataElementStatus;
}

export function setIndicatorVisibility(
    dataForm: DataForm,
    indicator: Indicator,
    isVisible: boolean
): DataForm {
    const prevStatus = dataForm.indicatorsStatus[indicator.id];
    const newStatus: IndicatorStatus = { ...defaultIndicatorStatus, ...prevStatus, visible: isVisible };
    const indicatorsStatus = { ...dataForm.indicatorsStatus, [indicator.id]: newStatus };
    return { ...dataForm, indicatorsStatus };
}

export function enableDataElement(dataForm: DataForm, dataElement: DataElement): DataForm {
    const prevStatus = dataForm.dataElementsStatus[dataElement.id];
    const newStatus: DataElementStatus = {
        ...defaultDataElementStatus,
        ...prevStatus,
        enabled: { type: "enabled" },
    };
    const dataElementsStatus = {
        ...dataForm.dataElementsStatus,
        [dataElement.id]: newStatus,
    };
    return { ...dataForm, dataElementsStatus };
}

export function disableDataElement(dataForm: DataForm, dataElement: DataElement, reason: string): DataForm {
    const prevStatus = dataForm.dataElementsStatus[dataElement.id];
    const newStatus: DataElementStatus = {
        ...defaultDataElementStatus,
        ...prevStatus,
        enabled: { type: "disabled", reason },
    };
    const dataElementsStatus = {
        ...dataForm.dataElementsStatus,
        [dataElement.id]: newStatus,
    };
    return { ...dataForm, dataElementsStatus };
}

export function setDataElementVisibility(
    dataForm: DataForm,
    dataElement: DataElement,
    isVisible: boolean
): DataForm {
    const prevStatus = dataForm.dataElementsStatus[dataElement.id];
    const newStatus: DataElementStatus = { ...defaultDataElementStatus, ...prevStatus, visible: isVisible };
    const dataElementsStatus = {
        ...dataForm.dataElementsStatus,
        [dataElement.id]: newStatus,
    };
    return { ...dataForm, dataElementsStatus };
}

export function getValue<DE extends DataElement>(dataForm: DataForm, dataElement: DE): ValueOf<DE> {
    return dataForm.values[dataElement.id] as ValueOf<DE>;
}

export function getComment(dataForm: DataForm, dataElement: DataElement): Maybe<string> {
    return dataForm.comments[dataElement.id];
}

export function setDataValue<DE extends DataElement>(
    dataForm: DataForm,
    dataElement: DE,
    value: ValueOf<DE>
): DataForm {
    return { ...dataForm, values: { ...dataForm.values, [dataElement.id]: value } };
}

export function setDataValueComment(
    dataForm: DataForm,
    dataElement: DataElement,
    comment: Maybe<string>
): DataForm {
    return { ...dataForm, comments: { ...dataForm.comments, [dataElement.id]: comment } };
}

export function setDataElementValueFromString<DE extends DataElement>(
    dataForm: DataForm,
    dataElement: DE,
    strValue: string
): DataForm {
    const value = getValueFromString<DE>(dataElement, strValue);
    return setDataValue(dataForm, dataElement, value);
}

type DataFormAttrs = DataForm;

export function buildDataForm(dataForm: DataFormAttrs): DataForm {
    return applyRulesToDataForm(dataForm);
}

export function setDataFormDataElement(dataForm: DataForm, dataElement: DataElement): DataForm {
    return {
        ...dataForm,
        dataSet: {
            ...dataForm.dataSet,
            dataElements: { ...dataForm.dataSet.dataElements, [dataElement.id]: dataElement },
        },
    };
}

export function updateDataValuesWithoutProcessing(dataForm: DataForm, dataValues: DataValue[]): DataForm {
    const valueByDataElementId = _.keyBy(dataValues, dv => dv.dataElementId);

    const dataFormUpdated = _(dataForm.dataSet.dataElements)
        .values()
        .reduce((dataFormAcc, dataElement) => {
            const dataValue = valueByDataElementId[dataElement.id];

            if (dataValue?.value !== undefined) {
                const dataForm2 = setDataElementValueFromString(dataFormAcc, dataElement, dataValue?.value);
                return setDataValueComment(dataForm2, dataElement, dataValue?.comment);
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

export function getDataItemsForSection(dataForm: DataForm, section: DataSetSection): DataItem[] {
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

function getDataElementsForSection(dataForm: DataForm, section: DataSetSection): DataElement[] {
    return _(section.dataElementIds)
        .map(deId => dataForm.dataSet.dataElements[deId])
        .compact()
        .value();
}

function getIndicatorsForSection(dataForm: DataForm, section: DataSetSection): Indicator[] {
    return _(section.indicatorIds)
        .map(deId => dataForm.dataSet.indicators[deId])
        .compact()
        .value();
}

export function isIndicatorVisible(dataForm: DataForm, indicator: Indicator): boolean {
    const status = dataForm.indicatorsStatus[indicator.id] || defaultIndicatorStatus;
    return status.visible;
}

export function isOrgUnitAssignedToDataForm(dataForm: DataForm, orgUnitId: Id) {
    return dataForm.dataSet.organisationUnits.has(orgUnitId);
}
