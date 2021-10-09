import { Id } from "./Base";
import { DataElement } from "./DataElement";
import { DataFormLogic } from "./DataFormLogic";
import { Indicator } from "./Indicator";

export interface DataSet {
    id: DataSetId;
    name: string;
    sections: DataSetSection[];
    organisationUnits: Set<Id>;
    dataElements: Record<Id, DataElement>;
    indicators: Record<Id, Indicator>;
    logic: DataFormLogic;
    maxOrgUnitLevel: number;
    periods: string[];
}

export interface DataSetSection {
    id: DataSetSectionId;
    name: string;
    dataElementIds: Id[];
    indicatorIds: Id[];
}

export type DataSetId = Id;

export type DataSetSectionId = Id;
