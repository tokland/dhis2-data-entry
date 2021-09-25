import { DatePicker } from "@material-ui/pickers";
import React from "react";
import { DataElementDate } from "../../../domain/entities/DataElement";
import { InnerComponentPropsFor } from "./FormComponent";
import { DateTime } from "luxon";
import { fromJsDate, toJsDate } from "../../../domain/entities/DateObj";

export const InputDate: React.FC<InnerComponentPropsFor<DataElementDate>> = React.memo(props => {
    const { dataElement, onChange, style } = props;

    const notifyChange = React.useCallback(
        (date: DateTime | null) => {
            const dateObj = date ? fromJsDate(date.toJSDate()) : undefined;
            onChange(dateObj);
        },
        [onChange]
    );

    const value = dataElement.value ? toJsDate(dataElement.value) : null;

    return (
        <DatePicker
            style={style}
            value={value}
            format="MM/dd/yyyy"
            onChange={notifyChange}
            autoOk={true}
            clearable={true}
        />
    );
});
