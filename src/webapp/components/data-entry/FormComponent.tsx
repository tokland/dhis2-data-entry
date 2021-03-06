import _ from "lodash";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { CSSProperties } from "react";
import styled, { css } from "styled-components";
import { DataElement, ValueOf } from "../../../domain/entities/DataElement";
import { useRefresher } from "../../hooks/use-refresher";
import { DataElementInfo } from "./DataElementInfo";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { useDataEntryContext } from "./DataEntryContext";
import {
    DataElementStatus,
    DataForm,
    getDataElementStatus,
    getValue,
    setDataValue,
} from "../../../domain/entities/DataForm";
import { getMessages } from "../../../domain/entities/rules/Validation";

export interface InnerComponentPropsFor<DE extends DataElement> {
    style: CSSProperties;
    dataElement: DE;
    value: ValueOf<DE>;
    enabled: DataElementStatus["enabled"];
    visible: DataElementStatus["visible"];
    onChange(value: ValueOf<DE>): void;
}

export type SavingState = "original" | "saving" | "saveSuccessful" | "saveError";

interface FormComponentPropsFor<DE extends DataElement> {
    component: React.FC<InnerComponentPropsFor<DE>>;
    dataForm: DataForm;
    dataElement: DE;
    setDataForm(dataForm: DataForm): void;
}

export function FormComponent<DE extends DataElement>(props: FormComponentPropsFor<DE>) {
    const { dataForm, component: Component, dataElement, setDataForm } = props;
    const { saveDataValue } = useDataEntryContext();
    const snackbar = useSnackbar();
    const [refreshKey, refresh] = useRefresher();
    const { orgUnit, period } = dataForm;
    const [savingState, setSavingState] = React.useState<SavingState>("original");
    const orgUnitPath = orgUnit.path;

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
                    setDataForm(dataFormUpdated);
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
            setDataForm,
            saveDataValue,
            savingState,
        ]
    );

    const save$ = useCallbackEffect(save);

    const { enabled, visible } = getDataElementStatus(dataForm, dataElement);

    return (
        <>
            <Component
                value={getValue(dataForm, dataElement)}
                key={refreshKey}
                style={feedbackStyles[savingState]}
                dataElement={dataElement}
                enabled={enabled}
                visible={visible}
                onChange={save$}
            />

            <DataElementInfo dataElement={dataElement} dataForm={dataForm} setDataForm={setDataForm} />
        </>
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
