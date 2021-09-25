import { FutureData } from "../../data/future";
import { Id } from "../entities/Base";
import { DataValueAudit } from "../entities/DataValueAudit";

export interface GetOptions {
    dataElementId: Id;
    orgUnitId: Id;
    period: string;
}

export interface DataValueAuditRepository {
    get(options: GetOptions): FutureData<DataValueAudit[]>;
}
