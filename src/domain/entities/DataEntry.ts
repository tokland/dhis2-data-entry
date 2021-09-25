import { Id } from "./Base";
import { DataForm } from "./DataForm";

export interface DataEntry {
    // TODO: create type without dataForm -> DataEntryParams
    dataForm: DataForm;
    period: string;
    orgUnitId: Id;
    orgUnitPath: Id[];
    // Move here dataValues and indicatorValues
}

export function getDataEntryKey(dataEntry: DataEntry): string {
    return [dataEntry.dataForm.id, dataEntry.period, dataEntry.orgUnitId].join(".");
}

export function getDataEntryTitle(dataEntry: DataEntry): string {
    return [dataEntry.dataForm.name].join(" - ");
}
