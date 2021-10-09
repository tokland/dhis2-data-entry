import { Id } from "./Base";
import { DataForm } from "./DataForm";

export interface DataEntry {
    // TODO: create type without dataForm -> DataEntryParams
    dataForm: DataForm;
    period: string;
    orgUnit: DataEntryOrgUnit;
    // Move here dataValues and indicatorValues
}

interface DataEntryOrgUnit {
    id: Id;
    path: Id[];
}

export function getDataEntryKey(dataEntry: DataEntry): string {
    return [dataEntry.dataForm.id, dataEntry.period, dataEntry.orgUnit.id].join(".");
}

export function getDataEntryTitle(dataEntry: DataEntry): string {
    return [dataEntry.dataForm.name].join(" - ");
}
