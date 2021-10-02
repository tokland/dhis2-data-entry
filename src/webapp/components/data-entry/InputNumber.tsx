import React, { ChangeEventHandler } from "react";
import { DataElementNumber } from "../../../domain/entities/DataElement";
import { InnerComponentPropsFor, Input } from "./FormComponent";
import { formatNumber } from "../../../utils/basic";
import { makeStyles } from "@material-ui/core";

export const InputNumber: React.FC<InnerComponentPropsFor<DataElementNumber>> = React.memo(props => {
    const { dataElement, value, onChange, style } = props;

    const [stateValue, setStateValue] = React.useState(value);

    React.useEffect(() => setStateValue(value), [value]);

    const updateState = React.useCallback<ChangeEventHandler<HTMLInputElement>>(
        ev => setStateValue(getValue(ev)),
        [setStateValue]
    );

    const notifyChange = React.useCallback<ChangeEventHandler<HTMLInputElement>>(
        ev => onChange(getValue(ev)),
        [onChange]
    );

    const isAutocalculated = dataElement.status.type === "disabled";
    const isInteger = ["INTEGER", "INTEGER_ZERO_OR_POSITIVE", "PERCENTAGE"].includes(dataElement.type);
    const step = isInteger ? 1 : 0.1;
    const classes = useStyles();

    if (isAutocalculated) {
        const disabledReason = dataElement.status.type === "disabled" ? dataElement.status.reason : undefined;
        const title = disabledReason || undefined;
        const decimals = isInteger ? 0 : 2;
        const strValue = stateValue !== undefined ? formatNumber(stateValue, decimals) : "";

        return <Input disabled={true} className={classes.disabled} title={title} value={strValue} />;
    } else {
        return (
            <Input
                disabled={false}
                style={style}
                type="number"
                step={step}
                value={stateValue === undefined ? "" : stateValue}
                onChange={updateState}
                onBlur={notifyChange}
            />
        );
    }
});

const useStyles = makeStyles({
    disabled: { backgroundColor: "#DDD" },
});

function getValue(ev: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = parseFloat(ev.target.value);
    const value = Number.isNaN(rawValue) ? undefined : rawValue;
    return value;
}
