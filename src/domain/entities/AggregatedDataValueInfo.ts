import { D2JobConfiguration } from "@eyeseetea/d2-api/2.34";
import { Maybe } from "../../utils/ts-utils";

export interface AggregatedDataValueInfo {
    nextExecutionTime: Maybe<Date>;
    lastExecutedStatus: Maybe<Status>;
    lastExecuted: Maybe<Date>;
}

export type Status = D2JobConfiguration["lastExecutedStatus"];
