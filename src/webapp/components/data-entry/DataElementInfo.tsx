import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import CommentIcon from "@material-ui/icons/Comment";
import { IconButton } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import { DataElement } from "../../../domain/entities/DataElement";
import { useBooleanState } from "../../hooks/use-boolean";
import { DataValueComment } from "./DataValueComment";
import { DataValueAudit } from "./DataValueAudit";
import { DataEntry } from "../../../domain/entities/DataEntry";
import i18n from "../../../locales";

export interface DataElementInfoProps {
    dataElement: DataElement;
    dataEntry: DataEntry;
    onChange(dataEntry: DataEntry): void;
}

export const DataElementInfo: React.FC<DataElementInfoProps> = React.memo(props => {
    const { dataElement, dataEntry, onChange } = props;

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
                    <DataValueComment dataElement={dataElement} dataEntry={dataEntry} onSave={onChange} />
                    <DataValueAudit dataElement={dataElement} dataEntry={dataEntry} />
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
