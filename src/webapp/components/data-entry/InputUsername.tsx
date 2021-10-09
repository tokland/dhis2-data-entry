import React from "react";
import _ from "lodash";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { CircularProgress, TextField } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import { DataElementText } from "../../../domain/entities/DataElement";
import i18n from "../../../locales";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { useBooleanState } from "../../hooks/use-boolean";
import { useDataEntryContext } from "./DataEntryContext";
import { InnerComponentPropsFor } from "./FormComponent";

type User = { username: string };

export const InputUsername: React.FC<InnerComponentPropsFor<DataElementText>> = React.memo(props => {
    const { value, onChange, style } = props;
    const { getUsers } = useDataEntryContext();
    const snackbar = useSnackbar();
    const [isSearching, setIsSearching] = React.useState(false);

    const notifyChange = React.useCallback<OnChange>(
        (_ev, option) => onChange(option?.username?.trim() || undefined),
        [onChange]
    );

    const [options, setOptions] = React.useState<User[]>([]);
    const [isOpen, { enable: open, disable: close }] = useBooleanState(false);
    const [stateValue, setStateValue] = React.useState(value);

    const searchUsers = useCallbackEffect(
        React.useCallback(
            (value: string) => {
                setStateValue(value);
                setIsSearching(true);

                return getUsers(value).run(
                    users => {
                        setIsSearching(false);
                        setOptions(users);
                    },
                    err => {
                        setIsSearching(false);
                        snackbar.error(err);
                    }
                );
            },
            [getUsers, snackbar]
        )
    );

    const searchUsersFromEvent = React.useCallback<OnInputChange>(
        (ev, value) => {
            if (ev) searchUsers(value);
        },
        [searchUsers]
    );

    React.useEffect(() => setStateValue(value), [value]);

    const fullStyle = React.useMemo(() => ({ ...style, ...styles.autocomplete }), [style]);

    const user = React.useMemo<User | null>(() => (value ? { username: value } : null), [value]);

    const openSelectorAndShowInitialSearch = React.useCallback(() => {
        open();
        searchUsers("");
    }, [searchUsers, open]);

    const closeSelectorAndRestoreValue = React.useCallback(() => {
        close();
        setStateValue(value);
    }, [setStateValue, close, value]);

    // Autocomplete shows a warning if the current value is not found as an option
    const userValue = isOpen ? null : user;
    const optionsWithUser = isOpen ? options : _.compact([userValue]);

    return (
        <Autocomplete<User>
            style={fullStyle}
            options={optionsWithUser}
            filterOptions={_.identity}
            value={userValue}
            inputValue={stateValue || ""}
            onInputChange={searchUsersFromEvent}
            getOptionLabel={option => option.username}
            open={isOpen}
            noOptionsText={i18n.t("No users found")}
            onChange={notifyChange}
            onOpen={openSelectorAndShowInitialSearch}
            onClose={closeSelectorAndRestoreValue}
            renderInput={params => (
                <TextField
                    {...params}
                    variant="outlined"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
});

type AutocompleteUserProps = AutocompleteProps<User, false, false, false>;
type OnChange = NonNullable<AutocompleteUserProps["onChange"]>;
type OnInputChange = NonNullable<AutocompleteUserProps["onInputChange"]>;

const styles = {
    autocomplete: { width: 500, display: "inline-flex" },
};
