import React from "react";
import { DataElement } from "../../../domain/entities/DataElement";
import { DataForm } from "../../../domain/entities/DataForm";
import { DataElementValue } from "./DataElementValue";
import { ItemHelp } from "./ItemHelp";
import { Row } from "./Row";
import { RowName } from "./RowName";

export interface DataElementRowProps {
    dataForm: DataForm;
    dataElement: DataElement;
    idx: number;
    setDataForm(dataForm: DataForm): void;
}

export const DataElementRow: React.FC<DataElementRowProps> = React.memo(props => {
    const { dataElement, dataForm, idx, setDataForm } = props;

    return (
        <Row key={dataElement.id} even={idx % 2 === 0}>
            <RowName data-element-id={dataElement.id} data-element-code={dataElement.code}>
                {dataElement.name}
                <ItemHelp dataItem={dataElement} />
            </RowName>

            <DataElementValue dataElement={dataElement} dataForm={dataForm} onChange={setDataForm} />
        </Row>
    );
});
