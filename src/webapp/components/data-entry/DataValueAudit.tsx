import { useSnackbar } from "@eyeseetea/d2-ui-components";
import {
    Card,
    CardContent,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@material-ui/core";
import React from "react";
import { DataElement } from "../../../domain/entities/DataElement";
import { DataForm } from "../../../domain/entities/DataForm";
import { DataValueAudit as DataValueAuditE } from "../../../domain/entities/DataValueAudit";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";

export interface DataValueCommentProps {
    dataElement: DataElement;
    dataForm: DataForm;
}

export const DataValueAudit: React.FC<DataValueCommentProps> = React.memo(props => {
    const { dataElement, dataForm } = props;
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const classes = useStyles();
    const [rows, setRows] = React.useState<DataValueAuditE[]>();

    React.useEffect(() => {
        compositionRoot.dataValues.getAudit
            .execute({
                dataElementId: dataElement.id,
                orgUnitId: dataForm.orgUnit.id,
                period: dataForm.period,
            })
            .run(setRows, snackbar.error);
    }, [compositionRoot, dataElement.id, dataForm.orgUnit.id, dataForm.period, snackbar]);

    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="h3">
                    {i18n.t("Audit trail")}
                </Typography>
            </CardContent>

            <CardContent className={classes.wrapper}>
                <TableContainer component={Paper}>
                    <Table className={classes.table} size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell>{i18n.t("On")}</TableCell>
                                <TableCell>{i18n.t("Modified by")}</TableCell>
                                <TableCell>{i18n.t("Value")}</TableCell>
                                <TableCell>{i18n.t("Modification")}</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {(rows || []).map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell component="th" scope="row">
                                        {formatDate(row.date)}
                                    </TableCell>
                                    <TableCell>{row.user}</TableCell>
                                    <TableCell>{formatValue(row.value)}</TableCell>
                                    <TableCell>{row.type}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
});

const useStyles = makeStyles({
    root: {
        maxWidth: "100%",
    },
    table: {
        minWidth: 650,
    },
    wrapper: {
        maxHeight: 300,
        overflowY: "scroll",
    },
});

export function formatDate(datetime: Date): string {
    const [date = "", hour = ""] = datetime.toISOString().split("T");
    return [date, " ", hour.split(".")[0]].join("");
}

function formatValue(value: string, options: { truncate?: number } = {}): string {
    const { truncate = 30 } = options;
    if (!value) {
        return i18n.t("No value");
    } else {
        return value.length > truncate ? `${value.slice(0, truncate - 5)} [...]` : value;
    }
}
