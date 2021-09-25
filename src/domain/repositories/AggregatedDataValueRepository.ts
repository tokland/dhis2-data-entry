import { FutureData } from "../../data/future";
import { AggregatedDataValue } from "../entities/AggregatedDataValue";
import { AggregatedDataValueInfo } from "../entities/AggregatedDataValueInfo";
import { Id } from "../entities/Base";

export interface AggregatedDataValueRepository {
    get(options: GetOptions): FutureData<AggregatedDataValue[]>;
    getAggregated(options: GetAggregatedOptions): FutureData<AggregatedDataValue[]>;
    getInfo(): FutureData<AggregatedDataValueInfo>;
}

export interface GetOptions {
    ids: Id[];
    periods: string[];
    orgUnitIds: Id[];
}

export interface GetAggregatedOptions {
    dataId: Id;
    sqlViewId: Id;
    period: string;
    orgUnitId: Id;
}
