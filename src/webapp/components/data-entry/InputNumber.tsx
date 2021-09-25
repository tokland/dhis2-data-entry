import React, { ChangeEventHandler } from "react";
import _ from "lodash";
import { DataElementNumber } from "../../../domain/entities/DataElement";
import { InnerComponentPropsFor, Input } from "./FormComponent";
import { formatNumber } from "../../../utils/basic";
import { makeStyles } from "@material-ui/core";

export const InputNumber: React.FC<InnerComponentPropsFor<DataElementNumber>> = React.memo(props => {
    const { dataElement, onChange, style } = props;

    const [value, setValue] = React.useState(dataElement.value);

    React.useEffect(() => setValue(dataElement.value), [dataElement.value]);

    const updateState = React.useCallback<ChangeEventHandler<HTMLInputElement>>(
        ev => setValue(getValue(ev)),
        [setValue]
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
        const strValue = value !== undefined ? formatNumber(value, decimals) : "";

        return <Input disabled={true} className={classes.disabled} title={title} value={strValue} />;
    } else {
        return (
            <Input
                disabled={false}
                style={style}
                type="number"
                step={step}
                value={value === undefined ? "" : value}
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
