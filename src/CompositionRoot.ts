import { D2Api } from "@eyeseetea/d2-api/2.34";
import { AggregatedDataValueDHIS2Repository } from "./data/AggregatedDataValueDHIS2Repository";
import { DataValueAuditDHIS2Repository } from "./data/DataAuditDHIS2Repository";
import { Dhis2DataValueRepository } from "./data/Dhis2DataValueRepository";
import { OrgUnitDHIS2Repository } from "./data/OrgUnitDHIS2Repository";
import { Config } from "./domain/entities/Config";
import { GetDataFormUseCase } from "./domain/usecases/GetDataFormUseCase";
import { GetDataValueAuditsUseCase } from "./domain/usecases/GetDataValueAuditsUseCase";
import { GetOrgUnitByIdUseCase } from "./domain/usecases/GetOrgUnitByIdUseCase";
import { GetOrgUnitsByIdsUseCase } from "./domain/usecases/GetOrgUnitsByIdsUseCase";
import { GetOrgUnitsByLevelUseCase } from "./domain/usecases/GetOrgUnitsByLevelUseCase";
import { GetOrgUnitsUseCase } from "./domain/usecases/GetOrgUnitsUseCase";
import { PostDataValueCommentUseCase } from "./domain/usecases/PostDataValueCommentUseCase";

export function getCompositionRoot(api: D2Api) {
    const dataValueRepository = new Dhis2DataValueRepository(api);
    const orgUnitRepository = new OrgUnitDHIS2Repository(api);
    const config: Config = { constants: {}, dataElements: [] };
    const dataValueAuditRepository = new DataValueAuditDHIS2Repository(api);
    const aggregatedDataValueRepository = new AggregatedDataValueDHIS2Repository(api, { serverDiffMs: 0 });

    return {
        getDataForm: new GetDataFormUseCase(
            config,
            dataValueRepository,
            aggregatedDataValueRepository,
            orgUnitRepository
        ),

        dataValues: {
            getAudit: new GetDataValueAuditsUseCase(dataValueAuditRepository),
            postComment: new PostDataValueCommentUseCase(dataValueRepository),
        },

        orgUnits: {
            get: new GetOrgUnitsUseCase(orgUnitRepository),
            getById: new GetOrgUnitByIdUseCase(orgUnitRepository),
            getByIds: new GetOrgUnitsByIdsUseCase(orgUnitRepository),
            getByLevel: new GetOrgUnitsByLevelUseCase(orgUnitRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

export interface UseCase {
    execute: Function;
}
