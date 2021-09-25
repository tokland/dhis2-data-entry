import React, { ChangeEventHandler } from "react";
import styled from "styled-components";
import { DataElementText } from "../../../domain/entities/DataElement";
import { InnerComponentPropsFor, Input, inputStyles } from "./FormComponent";

type EventHandler = ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

export const InputText: React.FC<InnerComponentPropsFor<DataElementText>> = React.memo(props => {
    const { dataElement, onChange, style } = props;

    const [value, setValue] = React.useState(dataElement.value);

    React.useEffect(() => setValue(dataElement.value), [dataElement.value]);

    const updateState = React.useCallback<EventHandler>(ev => setValue(ev.target.value), [setValue]);

    const notifyChange = React.useCallback<EventHandler>(ev => onChange(ev.target.value || undefined), [onChange]);

    if (dataElement.type === "LONG_TEXT") {
        return <TextArea rows={4} value={value} onChange={updateState} onBlur={notifyChange} style={style} />;
    } else {
        return <Input value={value} onChange={updateState} onBlur={notifyChange} style={style} />;
    }
});

const TextArea = styled.textarea`
    ${inputStyles}
    width: 60%;
    height: 100%;
`;
