import { FutureData } from "../../data/future";
import { Id } from "../entities/Base";
import { OrgUnit } from "../entities/OrgUnit";
import { OrgUnitRepository } from "../repositories/OrgUnitRepository";

export class GetOrgUnitByIdUseCase {
    constructor(private orgUnitRepository: OrgUnitRepository) {}

    execute(id: Id): FutureData<OrgUnit | undefined> {
        return this.orgUnitRepository.getById(id);
    }
}
