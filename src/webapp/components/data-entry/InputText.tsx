import React, { ChangeEventHandler } from "react";
import styled from "styled-components";
import { DataElementText } from "../../../domain/entities/DataElement";
import { InnerComponentPropsFor, Input, inputStyles } from "./FormComponent";

type EventHandler = ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

export const InputText: React.FC<InnerComponentPropsFor<DataElementText>> = React.memo(props => {
    const { dataElement, value, onChange, style } = props;

    const [stateValue, setStateValue] = React.useState(value);

    React.useEffect(() => setStateValue(value), [value]);

    const updateState = React.useCallback<EventHandler>(
        ev => setStateValue(ev.target.value),
        [setStateValue]
    );

    const notifyChange = React.useCallback<EventHandler>(
        ev => onChange(ev.target.value || undefined),
        [onChange]
    );

    if (dataElement.type === "LONG_TEXT") {
        return (
            <TextArea
                rows={4}
                value={stateValue}
                onChange={updateState}
                onBlur={notifyChange}
                style={style}
            />
        );
    } else {
        return <Input value={stateValue} onChange={updateState} onBlur={notifyChange} style={style} />;
    }
});

const TextArea = styled.textarea`
    ${inputStyles}
    width: 60%;
    height: 100%;
`;
