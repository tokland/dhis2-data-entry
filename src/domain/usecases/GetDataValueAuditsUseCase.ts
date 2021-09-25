import { Id } from "../entities/Base";
import { DataValueAuditRepository } from "../repositories/DataValueAuditRepository";

export class GetDataValueAuditsUseCase {
    constructor(private repository: DataValueAuditRepository) {}

    execute(options: { dataElementId: Id; orgUnitId: Id; period: string }) {
        const { dataElementId, orgUnitId, period } = options;

        return this.repository.get({
            dataElementId: dataElementId,
            orgUnitId: orgUnitId,
            period: period,
        });
    }
}
