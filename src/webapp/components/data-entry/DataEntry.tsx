import React from "react";
import _ from "lodash";
import styled from "styled-components";

import i18n from "../../../locales";
import { OrgUnitList } from "../../components/org-unit-list/OrgUnitList";
import { DataForm } from "./DataForm";
import { TreeViewOptions } from "../tree-view/TreeView";
import { OrgUnit } from "../../../domain/entities/OrgUnit";
import { DataForm as DataFormE } from "../../../domain/entities/DataForm";
import { AnalyticsInfo, AnalyticsInfoProps } from "./AnalyticsInfo";
import { Dropdown, DropdownItem } from "@eyeseetea/d2-ui-components";

export interface DataEntryProps {
    dataForm: DataFormE;
    getAnalyticsInfo: AnalyticsInfoProps["getAnalyticsInfo"];
}

export const DataEntry: React.FC<DataEntryProps> = React.memo(props => {
    const { dataForm, getAnalyticsInfo } = props;

    const [orgUnit, setOrgUnit] = React.useState<OrgUnit>();

    const treeViewOptions = React.useMemo<TreeViewOptions>(() => ({ initialExpandedUntilLevel: 2 }), []);

    const [_indicatorsKey, setIndicatorsKey] = React.useState("");

    //const rootIds = React.useMemo(() => config.currentUser.orgUnitsCapture.map(getId), [config]);
    const rootIds: string[] = [];

    const [period, setPeriod] = React.useState<string>();

    const items: DropdownItem[] = [];

    return (
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
                    <AnalyticsInfo onAnalyticsRun={setIndicatorsKey} getAnalyticsInfo={getAnalyticsInfo} />
                </HeaderBox>

                {orgUnit && dataForm && dataForm.organisationUnits.has(orgUnit.id) ? (
                    <>
                        <DataFormWrapper>
                            <PeriodSelector>
                                <Dropdown
                                    hideEmpty={true}
                                    label={i18n.t("Period")}
                                    value={period}
                                    items={items}
                                    onChange={setPeriod}
                                />
                            </PeriodSelector>
                        </DataFormWrapper>

                        {period && (
                            <DataForm
                                key={[dataForm.id, period, orgUnit.id].join("-")}
                                dataForm={dataForm}
                                period={period}
                                orgUnit={orgUnit}
                            />
                        )}
                    </>
                ) : (
                    i18n.t("Select an organisation unit assigned to the dataset to enter data")
                )}
            </RightPanel>
        </Container>
    );
});

const DataFormWrapper = styled.div`
    display: flex;
    padding: 10px 0px;
`;

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

const PeriodSelector = styled.div`
    margin-bottom: 10px;
    margin-right: 20px;
`;
