import _ from "lodash";
import { DateTime } from "luxon";
import { AggregatedDataValue } from "../domain/entities/AggregatedDataValue";
import { AggregatedDataValueInfo, Status } from "../domain/entities/AggregatedDataValueInfo";
import {
    AggregatedDataValueRepository,
    GetAggregatedOptions,
    GetOptions,
} from "../domain/repositories/AggregatedDataValueRepository";
import { D2Api } from "../types/d2-api";
import { Future } from "../utils/future";
import { Maybe } from "../utils/ts-utils";
import { FutureData, toFuture } from "./future";

export class AggregatedDataValueDHIS2Repository implements AggregatedDataValueRepository {
    constructor(private api: D2Api, private options: { serverDiffMs: number }) {}

    get(options: GetOptions): FutureData<AggregatedDataValue[]> {
        const analyticsResponse$ = this.api.analytics.get({
            dimension: ["dx:" + options.ids.join(";"), "pe:" + options.periods.join(";")],
            filter: ["ou:" + options.orgUnitIds.join(";")],
        });

        return toFuture(analyticsResponse$).map(analyticsResponse => {
            return _(analyticsResponse.rows)
                .map(row => getAggregatedDataValueFromAnalyticsRow(row))
                .compact()
                .value();
        });
    }

    getAggregated(options: GetAggregatedOptions): FutureData<AggregatedDataValue[]> {
        /* Use sql views to force aggregation for country levels, data elements have disaggregation disabled */
        const variables = {
            year: options.period,
            orgUnitId: options.orgUnitId,
            dx: options.dataId,
        };

        const runSqlViewResponse$ = this.api.sqlViews.query<typeof variables, "sum">(options.sqlViewId, variables);

        return toFuture(runSqlViewResponse$).map((res): AggregatedDataValue[] => {
            const { period, dataId } = options;
            const row = res.rows[0];
            return row ? [{ value: parseFloat(row.sum), strValue: row.sum, period, dataId }] : [];
        });
    }

    getInfo(): FutureData<AggregatedDataValueInfo> {
        const { serverDiffMs } = this.options;
        const res = this.api.models.jobConfigurations.get({
            filter: { name: { eq: "Analytics" } },
            fields: { nextExecutionTime: true, lastExecutedStatus: true, lastExecuted: true },
        });

        return toFuture(res).flatMap(({ objects: d2JobConfigurations }) => {
            const jobConfig = _.first(d2JobConfigurations);

            return jobConfig
                ? Future.success({
                      nextExecutionTime: parseDate(jobConfig.nextExecutionTime, serverDiffMs),
                      lastExecuted: parseDate(jobConfig.lastExecuted, serverDiffMs),
                      lastExecutedStatus: jobConfig.lastExecutedStatus as Status,
                  })
                : Future.error("No Analytics job configuration found");
        });
    }
}

function parseDate(s: Maybe<string>, offsetMs: number): Maybe<Date> {
    if (!s) return;
    const dataL = DateTime.fromISO(s).plus(offsetMs);
    return dataL.toJSDate();
}

function getAggregatedDataValueFromAnalyticsRow(row: string[]): Maybe<AggregatedDataValue> {
    const [dataId, period, value] = row;
    return dataId && period && value ? { dataId, period, value: parseFloat(value), strValue: value } : undefined;
}
