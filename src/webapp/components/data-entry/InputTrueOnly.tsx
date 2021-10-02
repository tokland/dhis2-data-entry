import { Checkbox } from "@material-ui/core";
import { SwitchBaseProps } from "@material-ui/core/internal/SwitchBase";
import React from "react";
import { DataElementBoolean } from "../../../domain/entities/DataElement";
import { InnerComponentPropsFor } from "./FormComponent";

export const InputTrueOnly: React.FC<InnerComponentPropsFor<DataElementBoolean>> = React.memo(props => {
    const { value, onChange, style } = props;

    const notifyChange = React.useCallback<NonNullable<SwitchBaseProps["onChange"]>>(
        () => onChange(!value),
        [onChange, value]
    );

    return <Checkbox style={style} checked={value || false} onChange={notifyChange} />;
});
