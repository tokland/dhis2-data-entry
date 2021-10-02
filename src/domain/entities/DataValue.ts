import _ from "lodash";
import { Code, CodedRef, getId, Id } from "./Base";

export interface DataValue {
    orgUnitId: Id;
    period: string;
    dataElementId: Id;
    categoryOptionComboId?: Id;
    // TODO: Review these optionals
    value?: string; // TODO: should this be typed?
    comment?: string;
}

export interface DataValueWithCode extends DataValue {
    dataElementCode: Code;
}

export function getDataValueId(dv: DataValue): string {
    // dv.categoryOptionComboId
    return _([dv.dataElementId, dv.orgUnitId, dv.period]).compact().join("-");
}

export function getDataValuesWithCode(
    dataElements: CodedRef[],
    dataValues: DataValue[]
): DataValueWithCode[] {
    const dataElementsById = _.keyBy(dataElements, getId);

    return dataValues.map(dataValue => ({
        ...dataValue,
        dataElementCode: dataElementsById[dataValue.dataElementId]?.code || "",
    }));
}
