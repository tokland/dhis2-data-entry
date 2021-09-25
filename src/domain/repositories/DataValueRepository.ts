import { FutureData } from "../../data/future";
import { Id } from "../../types/d2-api";
import { DataValue } from "../entities/DataValue";

export interface DataValueRepository {
    get(options: GetOptions): FutureData<DataValue[]>;
    getForChildren(options: GetForChildrenOptions): FutureData<DataValue[]>;

    postValue(options: { dataValue: DataValueToPost }): FutureData<void>;
    postValues(options: PostValuesOptions): FutureData<void>;
}

export interface GetOptions {
    orgUnitIds: Id[];
    dataSetIds: Id[];
    periods: string[];
    categoryOptionComboIds?: Id[];
    attributeOptionComboIds?: Id[];
    dataElementIdScheme?: "ID" | "CODE";
}

export interface PostValuesOptions {
    dataValues: DataValueToPost[];
}

export interface DataValueToPost {
    orgUnitId: Id;
    dataSetId: Id;
    period: string;
    dataElementId: Id;
    categoryOptionComboId?: Id;
    value?: string;
    defaultValue?: string; // Use to POST option data elements with a DELETE strategy (we need a valid value)
    comment?: string;
}

export interface GetForChildrenOptions {
    period: string;
    orgUnitId: Id;
    dataElementGroupIds?: Id[];
    dataSetIds?: Id[];
}
