import { OrgUnitRepository } from "../repositories/OrgUnitRepository";
import { OrgUnit } from "../entities/OrgUnit";
import { FutureData } from "../../data/future";

export class GetOrgUnitsByLevelUseCase {
    constructor(private orgUnitRepository: OrgUnitRepository) {}

    execute(level: number): FutureData<OrgUnit[]> {
        return this.orgUnitRepository.getByLevel(level);
    }
}
