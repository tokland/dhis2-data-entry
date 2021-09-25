import React from "react";
import { useSnackbar } from "@eyeseetea/d2-ui-components";

import { DataForm as DataFormE } from "../../../domain/entities/DataForm";
import { useAppContext } from "../../contexts/app-context";
import { DataFormTabbed } from "./DataFormTabbed";
import { DataEntry as DataEntryE, getDataEntryKey } from "../../../domain/entities/DataEntry";
import { useDataEntryContext } from "./data-entry-context";
import { OrgUnit } from "../../../domain/entities/OrgUnit";

export interface DataFormProps {
    dataForm: DataFormE;
    orgUnit: OrgUnit;
    period: string;
}

export const DataForm: React.FC<DataFormProps> = React.memo(props => {
    // TODO: Don't use compositionRoot at this level
    const { compositionRoot } = useAppContext();
    const { indicatorsKey } = useDataEntryContext();
    const { period, orgUnit } = props;
    const [dataEntry, setDataEntry] = React.useState<DataEntryE>();
    (window as any).app.dataEntry = dataEntry;

    const snackbar = useSnackbar();
    const emptyDataForm = props.dataForm;

    const setDataForm = React.useCallback(
        dataForm => {
            dataFormRef.current = dataForm;
            setDataEntry(dataEntry => (dataEntry ? { ...dataEntry, dataForm } : undefined));
        },
        [setDataEntry]
    );

    // We need the current dataForm in the getDataForm effect, but not as a dependency, use a ref instead
    const dataFormRef = React.useRef<DataFormE>();

    const isReload = Boolean(dataEntry && indicatorsKey);

    React.useEffect(() => {
        if (!period) return;

        return compositionRoot.getDataForm
            .execute({
                dataForm: dataFormRef.current || emptyDataForm,
                orgUnit,
                period,
                skipEditable: isReload,
            })
            .run(
                dataForm => {
                    dataFormRef.current = dataForm;
                    return setDataEntry({
                        dataForm,
                        period,
                        orgUnitId: orgUnit.id,
                        orgUnitPath: orgUnit.path,
                    });
                },
                err => snackbar.error(err)
            );
    }, [compositionRoot, orgUnit, isReload, indicatorsKey, emptyDataForm, period, setDataEntry, snackbar]);

    return (
        <React.Fragment>
            {dataEntry && (
                <DataFormTabbed key={getDataEntryKey(dataEntry)} dataEntry={dataEntry} setDataForm={setDataForm} />
            )}
        </React.Fragment>
    );
});
