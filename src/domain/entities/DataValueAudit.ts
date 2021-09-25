export interface DataValueAudit {
    type: "UPDATE" | "DELETE";
    date: Date;
    value: string;
    user: string;
}
