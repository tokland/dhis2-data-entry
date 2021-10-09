import { Id } from "./Base";
import { DataForm } from "./DataForm";

export interface DataEntry {
    dataForm: DataForm; // Move plain DataForm here?
    period: string;
    orgUnit: DataEntryOrgUnit;
}

interface DataEntryOrgUnit {
    id: Id;
    path: Id[];
}

export function getDataEntryKey(dataEntry: DataEntry): string {
    return [dataEntry.dataForm.dataSet.id, dataEntry.period, dataEntry.orgUnit.id].join(".");
}

export function getDataEntryTitle(dataEntry: DataEntry): string {
    return [dataEntry.dataForm.dataSet.name].join(" - ");
}
