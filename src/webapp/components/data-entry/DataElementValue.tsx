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
    dataForm: DataForm;
}

export const DataElementValue: React.FC<DataElementValueProps> = React.memo(props => {
    const { dataElement, dataForm, onChange } = props;

    return <Wrapper>{renderDataElement(dataElement, dataForm, onChange)}</Wrapper>;
});

function renderDataElement(
    dataElement: DataElement,
    dataForm: DataForm,
    onChange: (dataForm: DataForm) => void
): React.ReactChild {
    switch (dataElement.type) {
        case "TEXT":
        case "LONG_TEXT":
            return (
                <FormComponent<DataElementText>
                    component={InputText}
                    dataElement={dataElement}
                    dataForm={dataForm}
                    setDataForm={onChange}
                />
            );
        case "USERNAME":
            return (
                <FormComponent<DataElementText>
                    component={InputUsername}
                    dataElement={dataElement}
                    dataForm={dataForm}
                    setDataForm={onChange}
                />
            );
        case "BOOLEAN":
            return (
                <FormComponent<DataElementBoolean>
                    component={InputBoolean}
                    dataElement={dataElement}
                    dataForm={dataForm}
                    setDataForm={onChange}
                />
            );
        case "TRUE_ONLY":
            return (
                <FormComponent<DataElementBoolean>
                    component={InputTrueOnly}
                    dataElement={dataElement}
                    dataForm={dataForm}
                    setDataForm={onChange}
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
                    dataForm={dataForm}
                    setDataForm={onChange}
                />
            );
        case "DATE":
            return (
                <FormComponent<DataElementDate>
                    component={InputDate}
                    dataElement={dataElement}
                    dataForm={dataForm}
                    setDataForm={onChange}
                />
            );
        case "OPTION":
            return (
                <FormComponent<DataElementOption>
                    component={InputSelector}
                    dataElement={dataElement}
                    dataForm={dataForm}
                    setDataForm={onChange}
                />
            );
    }
}

const Wrapper = styled.div`
    flex-grow: 1;
`;
