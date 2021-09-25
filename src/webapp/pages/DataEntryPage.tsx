import React from "react";
import { FutureData } from "../../data/future";
import { AggregatedDataValueInfo } from "../../domain/entities/AggregatedDataValueInfo";
import { DataForm } from "../../domain/entities/DataForm";
import { Future } from "../../utils/future";
import { DataEntry } from "../components/data-entry/DataEntry";

export interface DataEntryPageProps {}

export const DataEntryPage: React.FC<DataEntryPageProps> = React.memo(() => {
    const dataForm: DataForm = {
        id: "12345",
        name: "Example form",
        sections: [],
        organisationUnits: new Set(),
        dataElements: {},
        indicators: {},
        logic: {
            entities: { dataElements: {} },
            rules: [],
            validations: [],
            getInitialDataValues: undefined,
            processDataFormsAfterSave: undefined,
        },
        maxOrgUnitLevel: 10,
        childrenOrgUnits: [],
        indicatorValues: {},
        initialDataValues: [],
        hidden: { indicators: new Set() },
        periods: ["2020", "2021"],
        constants: {},
    };

    const getAnalyticsInfo = React.useCallback((): FutureData<AggregatedDataValueInfo> => {
        return Future.success({
            nextExecutionTime: undefined,
            lastExecutedStatus: undefined,
            lastExecuted: undefined,
        });
    }, []);

    return <DataEntry dataForm={dataForm} getAnalyticsInfo={getAnalyticsInfo} />;
});
