import { Id } from "./Base";

export interface AggregatedDataValue {
    period: string;
    dataId: Id; // data element or indicator
    value: number;
    strValue: string;
}
