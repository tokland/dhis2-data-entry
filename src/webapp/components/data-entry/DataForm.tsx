import React from "react";

import { DataForm as DataFormE } from "../../../domain/entities/DataForm";
import { DataFormTabbed } from "./DataFormTabbed";

export interface DataFormProps {
    dataForm: DataFormE;
    setDataForm(dataForm: DataFormE): void;
}

export const DataForm: React.FC<DataFormProps> = React.memo(props => {
    const { dataForm, setDataForm } = props;

    return <DataFormTabbed dataForm={dataForm} setDataForm={setDataForm} />;
});
