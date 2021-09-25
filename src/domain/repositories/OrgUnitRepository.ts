import { FutureData } from "../../data/future";
import { Id } from "../entities/Base";
import { OrgUnit } from "../entities/OrgUnit";

export interface OrgUnitRepository {
    get(): FutureData<OrgUnit[]>;
    getById(id: Id): FutureData<OrgUnit | undefined>;
    getByIds(ids: Id[]): FutureData<OrgUnit[]>;
    getByLevel(level: number): FutureData<OrgUnit[]>;
    getChildren(id: Id): FutureData<OrgUnit[]>;
}
