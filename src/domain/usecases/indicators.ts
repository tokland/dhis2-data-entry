import _ from "lodash";
import { FutureData } from "../../data/future";
import { Future } from "../../utils/future";
import { Id } from "../entities/Base";
import { Config } from "../entities/Config";
import { DataForm } from "../entities/DataForm";
import { Indicator, evalIndicatorExpression, formatIndicatorValue } from "../entities/Indicator";
import { getOrgUnitIdFromPath, OrgUnitPath } from "../entities/OrgUnit";
import { AggregatedDataValueRepository } from "../repositories/AggregatedDataValueRepository";

export function updateDataFormIndicators(options: {
    dataForm: DataForm;
    period: string;
    orgUnitPath: OrgUnitPath;
    config: Config;
    aggregatedDataValueRepository: AggregatedDataValueRepository;
}): FutureData<DataForm> {
    const { dataForm } = options;

    const indicatorPairs$Ary = _.values(dataForm.dataSet.indicators).map(indicator => {
        return getIndicatorValue({ ...options, indicator }).map(
            value => [indicator.id, value] as [Id, string]
        );
    });

    return Future.parallel(indicatorPairs$Ary).map(pairs => {
        const indicatorValues = _.fromPairs(pairs);
        return { ...dataForm, indicatorValues };
    });
}

function getIndicatorValue(options: {
    indicator: Indicator;
    dataForm: DataForm;
    period: string;
    orgUnitPath: OrgUnitPath;
    config: Config;
    aggregatedDataValueRepository: AggregatedDataValueRepository;
}): FutureData<string> {
    const { indicator, dataForm, period, orgUnitPath, config, aggregatedDataValueRepository } = options;

    switch (indicator.type) {
        case "standard": {
            return evalIndicatorExpression(indicator, dataForm, config).match({
                success: value => Future.success(value),
                error: message => Future.error(message),
            });
        }
        case "sqlView": {
            const aggrDataValues$ = aggregatedDataValueRepository.getAggregated({
                sqlViewId: indicator.sqlViewId,
                dataId: indicator.dataId,
                period: period,
                orgUnitId: getOrgUnitIdFromPath(orgUnitPath),
            });

            return aggrDataValues$.map(aggrDataValues => {
                const strValue = _.first(aggrDataValues)?.strValue;
                return strValue ? formatIndicatorValue(indicator, parseFloat(strValue)) : "";
            });
        }
    }
}
