import React from "react";
import styled from "styled-components";

import i18n from "../../../locales";
import { OrgUnitList } from "../../components/org-unit-list/OrgUnitList";
import { DataForm } from "./DataForm";
import { TreeViewOptions } from "../tree-view/TreeView";
import { OrgUnit } from "../../../domain/entities/OrgUnit";
import { DataForm as DataFormE } from "../../../domain/entities/DataForm";
import { AnalyticsInfo, AnalyticsInfoProps } from "./AnalyticsInfo";
import { Dropdown, DropdownItem, useSnackbar } from "@eyeseetea/d2-ui-components";
import { DataEntryContext, DataEntryContextState } from "./DataEntryContext";
import { Future } from "../../../utils/future";
import { PostDataValueOptions } from "../../../domain/usecases/PostDataValueUseCase";
import { useAppContext } from "../../contexts/app-context";
import { DataSet } from "../../../domain/entities/DataSet";
import { getId } from "../../../domain/entities/Base";

export interface DataEntryProps {
    dataSet: DataSet;
    getAnalyticsInfo: AnalyticsInfoProps["getAnalyticsInfo"];
}

export const DataEntry: React.FC<DataEntryProps> = React.memo(props => {
    const { config, compositionRoot } = useAppContext();
    const { dataSet, getAnalyticsInfo } = props;

    const [orgUnit, setOrgUnit] = React.useState<OrgUnit>();

    const treeViewOptions = React.useMemo<TreeViewOptions>(() => ({ initialExpandedUntilLevel: 2 }), []);

    const [_indicatorsKey, setIndicatorsKey] = React.useState("");

    const rootIds = React.useMemo(() => config.currentUser.orgUnitsCapture.map(getId), [config]);

    const [period, setPeriod] = React.useState<string | undefined>(() => dataSet.periods[0]);

    const periodItems: DropdownItem[] = React.useMemo(
        () => dataSet.periods.map(period => ({ value: period, text: period })),
        [dataSet]
    );

    const dataEntryContext: DataEntryContextState = {
        indicatorsKey: "key",
        saveDataValue: (options: PostDataValueOptions) => {
            return compositionRoot.dataValues.postValue.execute(options);
        },
        getUsers(_search: string) {
            // TODO
            return Future.success([]);
        },
    };

    const [dataForm, setDataForm] = React.useState<DataFormE>();
    const snackbar = useSnackbar();

    React.useEffect(() => {
        if (!period || !orgUnit) return;

        return compositionRoot.getDataForm
            .execute({ dataSet, orgUnit, period })
            .run(setDataForm, err => snackbar.error(err));
    }, [compositionRoot, dataSet, orgUnit, period, snackbar]);

    // TODO: Allow to define the view structure with prop-less components (use DataEntryContext)

    return (
        <DataEntryContext.Provider value={dataEntryContext}>
            <Container>
                <LeftPanel>
                    <OrgUnitList
                        treeViewOptions={treeViewOptions}
                        onSelectedOrgUnit={setOrgUnit}
                        selected={orgUnit?.id}
                        rootIds={rootIds}
                    />
                </LeftPanel>

                <RightPanel>
                    <HeaderBox>
                        <AnalyticsInfo
                            onAnalyticsRun={setIndicatorsKey}
                            getAnalyticsInfo={getAnalyticsInfo}
                        />
                    </HeaderBox>

                    {dataForm && dataForm.dataSet.organisationUnits.has(dataForm.orgUnit.id) ? (
                        <>
                            <PeriodSelectorWrapper>
                                <Dropdown
                                    hideEmpty={true}
                                    label={i18n.t("Period")}
                                    value={period}
                                    items={periodItems}
                                    onChange={setPeriod}
                                />
                            </PeriodSelectorWrapper>

                            <DataForm dataForm={dataForm} setDataForm={setDataForm} />
                        </>
                    ) : (
                        i18n.t("Select an organisation unit assigned to the dataset to enter data")
                    )}
                </RightPanel>
            </Container>
        </DataEntryContext.Provider>
    );
});

const HeaderBox = styled.div`
    display: flex;
`;

const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
`;

const LeftPanel = styled.div`
    background-color: #f5f5f5;
    width: 400px;
    display: flex;
    justify-content: center;
`;

const RightPanel = styled.div`
    background-color: #fff;
    flex-grow: 1;
    display: flex;
    align-items: left;
    flex-direction: column;
    padding: 32px;
    max-width: 70%;
`;

const PeriodSelectorWrapper = styled.div`
    margin-bottom: 10px;
    margin-right: 20px;
`;
