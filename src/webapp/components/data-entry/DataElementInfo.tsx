import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import CommentIcon from "@material-ui/icons/Comment";
import { IconButton } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import { DataElement } from "../../../domain/entities/DataElement";
import { useBooleanState } from "../../hooks/use-boolean";
import { DataValueComment } from "./DataValueComment";
import { DataValueAudit } from "./DataValueAudit";
import i18n from "../../../locales";
import { DataForm } from "../../../domain/entities/DataForm";

export interface DataElementInfoProps {
    dataElement: DataElement;
    dataForm: DataForm;
    setDataForm(dataForm: DataForm): void;
}

export const DataElementInfo: React.FC<DataElementInfoProps> = React.memo(props => {
    const { dataElement, dataForm, setDataForm } = props;

    const [isInfoDialogOpen, { enable: openInfoDialog, disable: closeInfoDialog }] = useBooleanState(false);

    return (
        <React.Fragment>
            <InfoIcon onClick={openInfoDialog} disableRipple={true} tabIndex={-1} data-test-audit>
                <CommentIconStyled fontSize="small" color="primary" />
            </InfoIcon>

            {isInfoDialogOpen && (
                <ConfirmationDialog
                    isOpen={true}
                    title={dataElement.name}
                    cancelText={i18n.t("Close")}
                    onCancel={closeInfoDialog}
                    onClose={closeInfoDialog}
                    maxWidth="lg"
                    fullWidth={true}
                >
                    <DataValueComment dataElement={dataElement} dataForm={dataForm} onSave={setDataForm} />
                    <DataValueAudit dataElement={dataElement} dataForm={dataForm} />
                </ConfirmationDialog>
            )}
        </React.Fragment>
    );
});

const InfoIcon = styled(IconButton)`
    padding: 0;
    margin-bottom: 10px;
`;

const CommentIconStyled = styled(CommentIcon)`
    margin-left: 10px;
`;
