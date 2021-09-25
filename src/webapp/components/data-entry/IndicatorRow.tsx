import React from "react";
import { Indicator } from "../../../domain/entities/Indicator";
import { Row } from "./Row";
import { RowName } from "./RowName";
import { IndicatorValue } from "./IndicatorValue";
import { ItemHelp } from "./ItemHelp";
import { DataForm } from "../../../domain/entities/DataForm";

export interface IndicatorRowProps {
    dataForm: DataForm;
    indicator: Indicator;
    idx: number;
}

export const IndicatorRow: React.FC<IndicatorRowProps> = React.memo(props => {
    const { indicator, dataForm, idx } = props;

    return (
        <Row key={indicator.id} even={idx % 2 === 0}>
            <RowName
                data-indicator-id={indicator.id}
                data-indicator-code={indicator.code}
                data-indicator-type={indicator.type}
            >
                {indicator.name}
                {indicator.description && (
                    <span title={indicator.description}>
                        <ItemHelp dataItem={indicator} />
                    </span>
                )}
            </RowName>

            <IndicatorValue indicator={indicator} dataForm={dataForm} />
        </Row>
    );
});
