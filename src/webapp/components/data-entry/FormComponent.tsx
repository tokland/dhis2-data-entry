import _ from "lodash";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { CSSProperties } from "react";
import styled, { css } from "styled-components";
import { DataElement, ValueOf } from "../../../domain/entities/DataElement";
import { useRefresher } from "../../hooks/use-refresher";
import { DataElementInfo } from "./DataElementInfo";
import { DataEntry } from "../../../domain/entities/DataEntry";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { useDataEntryContext } from "./data-entry-context";
import { DataForm, getValue, setDataValue } from "../../../domain/entities/DataForm";
import { getMessages } from "../../../domain/entities/rules/Validation";

export interface InnerComponentPropsFor<DE extends DataElement> {
    style: CSSProperties;
    dataElement: DE;
    value: ValueOf<DE>;
    onChange(value: ValueOf<DE>): void;
}

export type SavingState = "original" | "saving" | "saveSuccessful" | "saveError";

interface FormComponentPropsFor<DE extends DataElement> {
    component: React.FC<InnerComponentPropsFor<DE>>;
    dataEntry: DataEntry;
    dataElement: DE;
    onChange(dataForm: DataForm): void;
}

export function FormComponent<DE extends DataElement>(props: FormComponentPropsFor<DE>) {
    const { dataEntry, component: Component, dataElement, onChange } = props;
    const { saveDataValue } = useDataEntryContext();
    const snackbar = useSnackbar();
    const [refreshKey, refresh] = useRefresher();
    const { dataForm, orgUnitPath, period } = dataEntry;
    const [savingState, setSavingState] = React.useState<SavingState>("original");

    const save = React.useCallback(
        (value: ValueOf<DE>) => {
            const valueHasChanged = value !== getValue(dataForm, dataElement);
            if (!valueHasChanged) return;

            const dataFormUpdated = setDataValue(dataForm, dataElement, value);
            const prevSavingState = savingState;
            setSavingState("saving");

            return saveDataValue({
                orgUnitPath,
                dataForm: dataFormUpdated,
                dataFormPrev: dataForm,
                period,
                dataElement,
            }).run(
                postDataValueResult => {
                    const { dataForm: dataFormUpdated, validation } = postDataValueResult;
                    const { warnings } = getMessages(validation);

                    if (!_(warnings).isEmpty()) {
                        snackbar.warning(warnings.join("\n"), { autoHideDuration: 5000 });
                    }

                    setSavingState("saveSuccessful");
                    onChange(dataFormUpdated);
                },
                postDataValueError => {
                    snackbar.error(postDataValueError.message, { autoHideDuration: 5000 });

                    switch (postDataValueError.type) {
                        case "server": {
                            setSavingState("saveError");
                            break;
                        }
                        case "validation": {
                            setSavingState(prevSavingState);
                            refresh();
                            break;
                        }
                    }
                }
            );
        },
        [
            dataElement,
            refresh,
            snackbar,
            orgUnitPath,
            dataForm,
            period,
            setSavingState,
            onChange,
            saveDataValue,
            savingState,
        ]
    );

    const save$ = useCallbackEffect(save);

    const notifyCommentSave = React.useCallback(
        (dataEntry: DataEntry) => {
            onChange(dataEntry.dataForm);
        },
        [onChange]
    );

    return (
        <div>
            <Component
                value={getValue(dataForm, dataElement)}
                key={refreshKey}
                style={feedbackStyles[savingState]}
                dataElement={dataElement}
                onChange={save$}
            />

            <DataElementInfo dataElement={dataElement} dataEntry={dataEntry} onChange={notifyCommentSave} />
        </div>
    );
}

/* TODO: Don't pass final styles to sub-components, but a value of feedback to display */
export const feedbackStyles: Record<SavingState, CSSProperties> = {
    original: { backgroundColor: "" },
    saving: { backgroundColor: "yellow" },
    saveSuccessful: { backgroundColor: "rgb(185, 255, 185)" },
    saveError: { backgroundColor: "red" },
};

export const inputStyles = css`
    padding-left: 12px;
    font-size: 16px;
    width: 100px;
    border: 1px solid #c4c4c4;
    border-radius: 3px;
    box-shadow: inset 0 0 2px 0 #c4c4c4;
    height: 42px;
    transition: background-color 0.5s;
`;

export const Input = styled.input`
    ${inputStyles}
`;
