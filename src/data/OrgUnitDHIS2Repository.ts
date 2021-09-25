import _ from "lodash";
import { CodedRef, Id, NamedRef } from "../domain/entities/Base";
import { OrgUnit } from "../domain/entities/OrgUnit";
import { OrgUnitRepository } from "../domain/repositories/OrgUnitRepository";
import { D2Api, D2ApiDefinition, D2OrganisationUnitSchema, Model, Ref } from "../types/d2-api";
import { FutureData, toFuture } from "./future";

interface D2OrgUnit {
    id: Id;
    code: string;
    name: string;
    shortName: string;
    level: number;
    path: string;
    parent: Ref;
    openingDate?: string;
    closedDate?: string;
    children: NamedRef[];
    organisationUnitGroups: CodedRef[];
}

type Options = Pick<Parameters<Model<D2ApiDefinition, D2OrganisationUnitSchema>["get"]>[0], "filter">;

export class OrgUnitDHIS2Repository implements OrgUnitRepository {
    constructor(private api: D2Api) {}

    get(): FutureData<OrgUnit[]> {
        return this.request({});
    }

    getById(id: Id): FutureData<OrgUnit | undefined> {
        return this.request({ filter: { id: { eq: id } } }).map(orgUnits => _.first(orgUnits));
    }

    getByIds(ids: Id[]): FutureData<OrgUnit[]> {
        return this.request({ filter: { id: { in: ids } } });
    }

    getByLevel(level: number): FutureData<OrgUnit[]> {
        return this.request({ filter: { level: { eq: `${level}` } } });
    }

    getChildren(id: Id): FutureData<OrgUnit[]> {
        return this.request({ filter: { path: { like: id } } }).map(orgUnits => orgUnits.filter(ou => ou.id !== id));
    }

    private getD2OrgUnits(options: Options): FutureData<D2OrgUnit[]> {
        const res = this.api.models.organisationUnits.get({
            ...options,
            fields: {
                $owner: true,
                children: { id: true, name: true },
                organisationUnitGroups: { id: true, code: true },
            },
            paging: false,
        });

        return toFuture(res).map(res => res.objects);
    }

    private request(options: Options): FutureData<OrgUnit[]> {
        return this.getD2OrgUnits(options).map(d2OrgUnits => d2OrgUnits.map(data => this.buildOrgUnit(data)));
    }

    private buildOrgUnit(d2OrgUnit: D2OrgUnit): OrgUnit {
        return {
            ...d2OrgUnit,
            path: d2OrgUnit.path.replace(/^\//, "").split("/"),
            openingDate: d2OrgUnit.openingDate ? new Date(d2OrgUnit.openingDate) : undefined,
            closedDate: d2OrgUnit.closedDate ? new Date(d2OrgUnit.closedDate) : undefined,
        };
    }
}
