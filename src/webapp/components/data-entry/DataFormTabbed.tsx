import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
    DataForm,
    getDataItemsForSection,
    isDataElementVisible,
    isIndicatorVisible,
} from "../../../domain/entities/DataForm";
import { TabPanel } from "./TabPanel";
import { Collapse } from "@material-ui/core";
import { DataElementRow } from "./DataElementRow";
import { IndicatorRow } from "./IndicatorRow";
import { match } from "../../../utils/match";

interface DataFormTabbedProps {
    dataForm: DataForm;
    setDataForm(dataForm: DataForm): void;
}

export const DataFormTabbed: React.FC<DataFormTabbedProps> = React.memo(props => {
    const { dataForm, setDataForm } = props;
    const [currentSectionIdx, setCurrentSectionIdxFromOnChange] = useSectionState(0);
    const sections = dataForm.dataSet.sections.filter(section => section.visible);

    return (
        <div>
            <AppBar position="static">
                <Tabs
                    value={currentSectionIdx}
                    onChange={setCurrentSectionIdxFromOnChange}
                    variant="scrollable"
                    data-test="sections"
                >
                    {sections.map(section => (
                        <Tab key={section.id} label={section.name} />
                    ))}
                </Tabs>
            </AppBar>

            {sections.map((section, idx) => (
                <TabPanel key={section.id} value={currentSectionIdx} index={idx} data-test="data">
                    {getDataItemsForSection(dataForm, section).map((item, idx) =>
                        match(item, {
                            dataElement: ({ item: dataElement }) => (
                                <Collapse
                                    in={isDataElementVisible(dataForm, dataElement)}
                                    key={dataElement.id}
                                >
                                    <DataElementRow
                                        idx={idx}
                                        dataElement={dataElement}
                                        setDataForm={setDataForm}
                                        dataForm={dataForm}
                                    />
                                </Collapse>
                            ),
                            indicator: ({ item: indicator }) => (
                                <Collapse in={isIndicatorVisible(dataForm, indicator)} key={indicator.id}>
                                    <IndicatorRow idx={idx} indicator={indicator} dataForm={dataForm} />
                                </Collapse>
                            ),
                        })
                    )}
                </TabPanel>
            ))}
        </div>
    );
});

function useSectionState(
    initialSectionIdx: number
): [number, (_ev: React.ChangeEvent<{}>, index: number) => void] {
    const [currentSectionIdx, setCurrentSectionIdx] = React.useState(initialSectionIdx);

    const setCurrentSectionIdxFromOnChange = React.useCallback(
        (_ev: React.ChangeEvent<{}>, index: number) => {
            setCurrentSectionIdx(index);
        },
        [setCurrentSectionIdx]
    );

    return [currentSectionIdx, setCurrentSectionIdxFromOnChange];
}
