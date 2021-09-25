import React from "react";
import { createStyles, FormControl, makeStyles, MenuItem, Select, Theme } from "@material-ui/core";
import { DataElementOption } from "../../../domain/entities/DataElement";
import { component } from "../../utils/react";
import { InnerComponentPropsFor } from "./FormComponent";
import i18n from "../../../locales";

const InputSelector_: React.FC<InnerComponentPropsFor<DataElementOption>> = props => {
    const { dataElement, onChange, style } = props;

    const notifyChange = React.useCallback(
        (event: React.ChangeEvent<{ value: unknown }>) => {
            onChange(event.target.value as string);
        },
        [onChange]
    );

    const items = React.useMemo(
        () =>
            [{ text: i18n.t("No value"), value: "" }].concat(
                dataElement.options.map(option => ({ value: option.code, text: option.name }))
            ),
        [dataElement]
    );

    const classes = useStyles();
    const value = dataElement.value || "";

    return (
        <FormControl className={classes.formControl}>
            <Select style={style} value={value} onChange={notifyChange}>
                {items.map(item => (
                    <MenuItem key={item.value} value={item.value}>
                        {item.value ? <span>{item.text}</span> : <i>{item.text}</i>}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    })
);

// REFACTOR All components in app should use this pattern to have a displayName
export const InputSelector = component(InputSelector_);
