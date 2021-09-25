import { OrgUnitRepository } from "../repositories/OrgUnitRepository";
import { OrgUnit } from "../entities/OrgUnit";
import { FutureData } from "../../data/future";

export class GetOrgUnitsUseCase {
    constructor(private orgUnitRepository: OrgUnitRepository) {}

    execute(): FutureData<OrgUnit[]> {
        return this.orgUnitRepository.get();
    }
}
