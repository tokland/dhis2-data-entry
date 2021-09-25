import React from "react";
import styled from "styled-components";
import {
    DataElement,
    DataElementDate,
    DataElementNumber,
    DataElementOption,
    DataElementText,
    DataElementBoolean,
} from "../../../domain/entities/DataElement";
import { DataEntry } from "../../../domain/entities/DataEntry";
import { FormComponent } from "./FormComponent";
import { InputTrueOnly } from "./InputTrueOnly";
import { InputDate } from "./InputDate";
import { InputNumber } from "./InputNumber";
import { InputSelector } from "./InputSelector";
import { InputText } from "./InputText";
import { InputBoolean } from "./InputBoolean";
import { DataForm } from "../../../domain/entities/DataForm";
import { InputUsername } from "./InputUsername";

export interface DataElementValueProps {
    dataElement: DataElement;
    onChange(dataForm: DataForm): void;
    dataEntry: DataEntry;
}

export const DataElementValue: React.FC<DataElementValueProps> = React.memo(props => {
    const { dataElement, dataEntry, onChange } = props;

    return <Wrapper>{renderDataElement(dataElement, dataEntry, onChange)}</Wrapper>;
});

function renderDataElement(
    dataElement: DataElement,
    dataEntry: DataEntry,
    onChange: (dataForm: DataForm) => void
): React.ReactChild {
    switch (dataElement.type) {
        case "TEXT":
        case "LONG_TEXT":
            return (
                <FormComponent<DataElementText>
                    component={InputText}
                    dataElement={dataElement}
                    dataEntry={dataEntry}
                    onChange={onChange}
                />
            );
        case "USERNAME":
            return (
                <FormComponent<DataElementText>
                    component={InputUsername}
                    dataElement={dataElement}
                    dataEntry={dataEntry}
                    onChange={onChange}
                />
            );
        case "BOOLEAN":
            return (
                <FormComponent<DataElementBoolean>
                    component={InputBoolean}
                    dataElement={dataElement}
                    dataEntry={dataEntry}
                    onChange={onChange}
                />
            );
        case "TRUE_ONLY":
            return (
                <FormComponent<DataElementBoolean>
                    component={InputTrueOnly}
                    dataElement={dataElement}
                    dataEntry={dataEntry}
                    onChange={onChange}
                />
            );

        case "NUMBER":
        case "INTEGER":
        case "INTEGER_ZERO_OR_POSITIVE":
        case "PERCENTAGE":
            return (
                <FormComponent<DataElementNumber>
                    component={InputNumber}
                    dataElement={dataElement}
                    dataEntry={dataEntry}
                    onChange={onChange}
                />
            );
        case "DATE":
            return (
                <FormComponent<DataElementDate>
                    component={InputDate}
                    dataElement={dataElement}
                    dataEntry={dataEntry}
                    onChange={onChange}
                />
            );
        case "OPTION":
            return (
                <FormComponent<DataElementOption>
                    component={InputSelector}
                    dataElement={dataElement}
                    dataEntry={dataEntry}
                    onChange={onChange}
                />
            );
    }
}

const Wrapper = styled.div`
    flex-grow: 1;
`;
