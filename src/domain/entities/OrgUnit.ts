import _ from "lodash";
import { Maybe } from "../../utils/ts-utils";
import { CodedRef, Id, NamedRef } from "./Base";

export interface OrgUnit {
    id: Id;
    path: OrgUnitPath;
    code: string | undefined;
    openingDate: Date | undefined;
    closedDate: Date | undefined;
    name: string;
    level: number;
    children: NamedRef[];
    organisationUnitGroups: CodedRef[];
}

export type OrgUnitPath = Id[];

export function getOrgUnitIdFromPath(path: OrgUnitPath): Id {
    const orgUnitId = _.last(path);
    if (!orgUnitId) throw new Error("No org unit id");
    return orgUnitId;
}

export function getOrgUnitParentId(orgUnit: OrgUnit): Maybe<Id> {
    const index = orgUnit.path.length - 2;
    return index >= 0 ? orgUnit.path[index] : undefined;
}
