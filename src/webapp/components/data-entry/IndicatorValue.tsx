import React from "react";
import styled from "styled-components";
import { DataForm } from "../../../domain/entities/DataForm";
import { Indicator } from "../../../domain/entities/Indicator";
import { inputStyles } from "./FormComponent";

export interface IndicatorValueProps {
    dataForm: DataForm;
    indicator: Indicator;
}

export const IndicatorValue: React.FC<IndicatorValueProps> = React.memo(props => {
    const { dataForm, indicator } = props;
    const value = dataForm.indicatorValues[indicator.id] || "";

    return (
        <Wrapper>
            <Value value={value} disabled={true} />
        </Wrapper>
    );
});

const Wrapper = styled.div`
    flex-grow: 1;
`;

export const Value = styled.input`
    ${inputStyles}
    background-color: #DDD;
    width: 200px;
`;
