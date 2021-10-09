import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { TextField } from "@material-ui/core";
import React from "react";
import { DataElement } from "../../../domain/entities/DataElement";
import { DataForm, getComment, setDataValueComment } from "../../../domain/entities/DataForm";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { feedbackStyles, SavingState } from "./FormComponent";

export interface DataValueCommentProps {
    dataElement: DataElement;
    dataForm: DataForm;
    onSave(dataForm: DataForm): void;
}

export const DataValueComment: React.FC<DataValueCommentProps> = React.memo(props => {
    const { dataElement, dataForm, onSave } = props;
    const { compositionRoot } = useAppContext();
    const [state, setState] = React.useState<SavingState>("original");
    const snackbar = useSnackbar();

    const saveComment = React.useCallback(
        (ev: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const comment = ev.target.value;
            const { orgUnit, period } = dataForm;
            const dataSetId = dataForm.dataSet.id;

            setState("saving");

            return compositionRoot.dataValues.postComment
                .execute({
                    orgUnitId: orgUnit.id,
                    dataSetId: dataSetId,
                    period,
                    dataElement,
                    comment,
                })
                .run(
                    () => {
                        setState("saveSuccessful");
                        onSave(setDataValueComment(dataForm, dataElement, comment));
                    },
                    errorMessage => {
                        snackbar.error(errorMessage);
                        return setState("saveError");
                    }
                );
        },
        [compositionRoot, onSave, dataElement, dataForm, snackbar]
    );

    const saveCommentEffect = useCallbackEffect(saveComment);

    return (
        <TextField
            style={feedbackStyles[state]}
            label={i18n.t("Comment")}
            variant="outlined"
            fullWidth={true}
            multiline={true}
            rows={4}
            rowsMax={4}
            defaultValue={getComment(dataForm, dataElement)}
            onBlur={saveCommentEffect}
        />
    );
});
