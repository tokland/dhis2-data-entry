import React from "react";
import { FutureData } from "../../data/future";
import { AggregatedDataValueInfo } from "../../domain/entities/AggregatedDataValueInfo";
import { DataElement } from "../../domain/entities/DataElement";
import { DataForm, DataFormSection } from "../../domain/entities/DataForm";
import { Future } from "../../utils/future";
import { DataEntry } from "../components/data-entry/DataEntry";

export interface DataEntryPageProps {}

export const DataEntryPage: React.FC<DataEntryPageProps> = React.memo(() => {
    const dataElement: DataElement = {
        id: "WmKwIxATeAB",
        name: "Country Grant - # Training Events",
        code: "TRAINING_EVENTS",
        comment: "Some comment",
        visible: true,
        status: { type: "enabled" },
        description: "description",
        type: "NUMBER",
        value: undefined,
    };

    const section1: DataFormSection = {
        id: "section1",
        name: "Section 1",
        dataElementIds: ["WmKwIxATeAB"],
        indicatorIds: [],
        visible: true,
    };

    const dataForm: DataForm = {
        id: "NQOwInnRDNL",
        name: "Example form",
        sections: [section1],
        organisationUnits: new Set(["qhFcrUfkuL6"]),
        dataElements: { WmKwIxATeAB: dataElement },
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
