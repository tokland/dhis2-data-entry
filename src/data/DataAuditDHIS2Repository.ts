import { DataValueAudit } from "../domain/entities/DataValueAudit";
import { DataValueAudit as D2DataValueAudit } from "@eyeseetea/d2-api/api/audit";
import { DataValueAuditRepository, GetOptions } from "../domain/repositories/DataValueAuditRepository";
import { D2Api } from "../types/d2-api";
import { FutureData, toFuture } from "./future";

export class DataValueAuditDHIS2Repository implements DataValueAuditRepository {
    constructor(private api: D2Api) {}

    get(options: GetOptions): FutureData<DataValueAudit[]> {
        const { dataElementId, orgUnitId, period } = options;

        const res = this.api.audit.getDataValues({
            de: [dataElementId],
            ou: [orgUnitId],
            pe: [period],
            pageSize: 100,
        });

        return toFuture(res).map(res => res.objects.map(getDataValueAudit));
    }
}

function getDataValueAudit(d2DataValueAudit: D2DataValueAudit): DataValueAudit {
    const dva = d2DataValueAudit;
    return {
        type: dva.auditType,
        date: new Date(dva.created),
        value: dva.value,
        user: dva.modifiedBy,
    };
}
