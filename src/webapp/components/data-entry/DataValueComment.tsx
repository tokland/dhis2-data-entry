import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { TextField } from "@material-ui/core";
import React from "react";
import { DataElement, setDataValueComment } from "../../../domain/entities/DataElement";
import { DataEntry } from "../../../domain/entities/DataEntry";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { feedbackStyles, SavingState } from "./FormComponent";

export interface DataValueCommentProps {
    dataElement: DataElement;
    dataEntry: DataEntry;
    onSave(dataElement: DataElement): void;
}

export const DataValueComment: React.FC<DataValueCommentProps> = React.memo(props => {
    const { dataElement, dataEntry, onSave } = props;
    const { compositionRoot } = useAppContext();
    const [state, setState] = React.useState<SavingState>("original");
    const snackbar = useSnackbar();

    const saveComment = React.useCallback(
        (ev: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const comment = ev.target.value;
            const { orgUnitId, dataForm, period } = dataEntry;
            const newDataElement = setDataValueComment(dataElement, comment);
            const dataFormId = dataForm.id;

            setState("saving");

            return compositionRoot.dataValues.postComment
                .execute({
                    orgUnitId,
                    dataFormId,
                    period,
                    dataElement: newDataElement,
                })
                .run(
                    () => {
                        setState("saveSuccessful");
                        onSave(newDataElement);
                    },
                    errorMessage => {
                        snackbar.error(errorMessage);
                        return setState("saveError");
                    }
                );
        },
        [compositionRoot, onSave, dataElement, dataEntry, snackbar]
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
            defaultValue={dataElement.comment}
            onBlur={saveCommentEffect}
        />
    );
});
