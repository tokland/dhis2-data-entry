import { Id, Ref } from "./Base";
import { Constant } from "./Constant";
import { DataElement } from "./DataElement";

export interface Config {
    currentUser: { orgUnitsCapture: Ref[] };
    constants: Record<Id, Constant>;
    dataElements: DataElement[];
}
