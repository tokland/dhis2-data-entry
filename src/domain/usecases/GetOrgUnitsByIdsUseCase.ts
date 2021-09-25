import { OrgUnitRepository } from "../repositories/OrgUnitRepository";
import { OrgUnit } from "../entities/OrgUnit";
import { Id } from "../entities/Base";
import { FutureData } from "../../data/future";

export class GetOrgUnitsByIdsUseCase {
    constructor(private orgUnitRepository: OrgUnitRepository) {}

    execute(ids: Id[]): FutureData<OrgUnit[]> {
        return this.orgUnitRepository.getByIds(ids);
    }
}
