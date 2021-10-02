import React from "react";
import styled from "styled-components";
import i18n from "../../../locales";
import { AggregatedDataValueInfo } from "../../../domain/entities/AggregatedDataValueInfo";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { FutureData } from "../../../data/future";

export interface AnalyticsInfoProps {
    onAnalyticsRun(timestamp: string): void;
    getAnalyticsInfo(): FutureData<AggregatedDataValueInfo>;
}

export const AnalyticsInfo: React.FC<AnalyticsInfoProps> = React.memo(props => {
    const { onAnalyticsRun, getAnalyticsInfo } = props;
    const [messages, setMessages] = React.useState<string[]>();

    const getAnalyticsInfoCb = useCallbackEffect(
        React.useCallback(() => {
            return getAnalyticsInfo().run(
                analyticsInfo => {
                    const timestamp = analyticsInfo.lastExecuted?.toISOString() || "";
                    onAnalyticsRun(timestamp);
                    return setMessages(formatAnalyticsInfo(analyticsInfo));
                },
                msg => setMessages([msg])
            );
        }, [getAnalyticsInfo, onAnalyticsRun])
    );

    React.useEffect(() => {
        getAnalyticsInfoCb();
        const intervalId = setInterval(() => getAnalyticsInfo(), 60 * 1000);
        return () => clearInterval(intervalId);
    }, [getAnalyticsInfoCb, getAnalyticsInfo, setMessages]);

    return (
        <Wrapper>
            <b>{i18n.t("Analytics")}</b>
            {messages
                ? messages.map((msg, idx) => <AnalyticsInfoLine key={idx}>{msg}</AnalyticsInfoLine>)
                : "..."}
        </Wrapper>
    );
});

const Wrapper = styled.div`
    margin-left: auto;
`;

const AnalyticsInfoLine = styled.div``;

function formatAnalyticsInfo(info: AggregatedDataValueInfo): string[] {
    return [
        [
            i18n.t("Last"),
            ": ",
            info.lastExecuted ? formatDateTime(info.lastExecuted) : i18n.t("Not executed"),
            info.lastExecutedStatus && info.lastExecutedStatus !== "COMPLETED"
                ? " (" + (info.lastExecutedStatus || "-") + ")"
                : "",
        ].join(""),
        [
            i18n.t("Next"),
            ": ",
            info.nextExecutionTime ? formatDateTime(info.nextExecutionTime) : i18n.t("Disabled"),
        ].join(""),
    ];
}

function formatDateTime(datetime: Date): string {
    const date = datetime.toLocaleDateString();
    const time = datetime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
}
