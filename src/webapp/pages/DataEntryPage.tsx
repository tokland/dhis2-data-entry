import React from "react";
import { FutureData } from "../../data/future";
import { AggregatedDataValueInfo } from "../../domain/entities/AggregatedDataValueInfo";
import { DataElement } from "../../domain/entities/DataElement";
import { DataSet, DataSetSection } from "../../domain/entities/DataSet";
import { Future } from "../../utils/future";
import { DataEntry } from "../components/data-entry/DataEntry";

export interface DataEntryPageProps {}

export const DataEntryPage: React.FC<DataEntryPageProps> = React.memo(() => {
    const dataElement: DataElement = {
        id: "WmKwIxATeAB",
        name: "Country Grant - # Training Events",
        code: "TRAINING_EVENTS",
        description: "description",
        type: "INTEGER_ZERO_OR_POSITIVE",
    };

    const dataElement2: DataElement = {
        id: "RivqZao3W5N",
        name: "Country Grant - Inherit Template",
        code: "INHERIT_TEMPLATE",
        description: "description",
        type: "BOOLEAN",
    };

    const section1: DataSetSection = {
        id: "section1",
        name: "Section 1",
        dataElementIds: ["WmKwIxATeAB", "RivqZao3W5N"],
        indicatorIds: [],
    };

    const dataSet: DataSet = {
        id: "NQOwInnRDNL",
        name: "Example form",
        sections: [section1],
        organisationUnits: new Set(["qhFcrUfkuL6"]),
        dataElements: { [dataElement.id]: dataElement, [dataElement2.id]: dataElement2 },
        indicators: {},
        periods: ["2020", "2021"],
        logic: {
            entities: { dataElements: {} },
            rules: [],
            validations: [],
        },
        maxOrgUnitLevel: 10,
    };

    const getAnalyticsInfo = React.useCallback((): FutureData<AggregatedDataValueInfo> => {
        return Future.success({
            nextExecutionTime: undefined,
            lastExecutedStatus: undefined,
            lastExecuted: undefined,
        });
    }, []);

    return <DataEntry dataSet={dataSet} getAnalyticsInfo={getAnalyticsInfo} />;
});
