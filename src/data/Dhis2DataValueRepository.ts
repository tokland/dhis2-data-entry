import { HttpResponse } from "@eyeseetea/d2-api/api/common";
import _ from "lodash";
import { Id } from "../domain/entities/Base";
import { DataValue } from "../domain/entities/DataValue";
import {
    DataValueRepository,
    DataValueToPost,
    GetForChildrenOptions,
    GetOptions,
    PostValuesOptions,
} from "../domain/repositories/DataValueRepository";
import {
    D2Api,
    DataValuePostRequest,
    DataValueSetsDataValue,
    DataValueSetsPostParams,
    DataValueSetsPostRequest,
} from "../types/d2-api";
import { Future } from "../utils/future";
import { FutureData, toFuture, toGenericFuture } from "./future";

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    get(options: GetOptions): FutureData<DataValue[]> {
        const res = this.api.dataValues.getSet({
            period: options.periods,
            dataSet: options.dataSetIds,
            orgUnit: options.orgUnitIds,
            dataElementIdScheme: options.dataElementIdScheme,
        });

        return toFuture(res).map(d2DataValuesRes => d2DataValuesRes.dataValues.map(getDataValue));
    }

    getForChildren(options: GetForChildrenOptions): FutureData<DataValue[]> {
        const res = this.api.dataValues.getSet({
            dataSet: options.dataSetIds || [],
            children: true,
            period: [options.period],
            orgUnit: [options.orgUnitId],
            dataElementGroup: options.dataElementGroupIds,
        });

        return toFuture(res).map(d2DataValuesRes => d2DataValuesRes.dataValues.map(getDataValue));
    }

    postValue(options: { dataValue: DataValueToPost }): FutureData<void> {
        const { dataValue } = options;
        const { dataSetId, value, comment } = dataValue;

        const d2DataValue: DataValuePostRequest = {
            de: dataValue.dataElementId,
            ds: dataSetId,
            ...(dataValue.categoryOptionComboId ? { co: dataValue.categoryOptionComboId } : {}),
            ou: dataValue.orgUnitId,
            pe: dataValue.period,
            ...(value !== undefined ? { value } : {}),
            ...(comment !== undefined ? { comment } : {}),
        };

        const res = this.api.dataValues.post(d2DataValue);
        const res$ = toGenericFuture<HttpResponse<void>, void>(res);
        return res$.mapError(err => err.message || "Unknown error");
    }

    postValues(options: PostValuesOptions): FutureData<void> {
        const dataValuesByDataSetId = _.toPairs(_.groupBy(options.dataValues, dv => dv.dataSetId));

        const res = dataValuesByDataSetId.map(([dataSetId, dataValues]) => {
            // Empty values must use a DELETE strategy + field deleted=true + valid value for option value
            const [emptyDataValues, nonEmptyDataValues] = _.partition(dataValues, dv => dv.value === "");

            return Future.parallel([
                this.postDataValues(dataSetId, nonEmptyDataValues, { importStrategy: "CREATE_AND_UPDATE" }),
                this.postDataValues(dataSetId, emptyDataValues, { importStrategy: "DELETE" }),
            ]).map(_res => undefined);
        });

        return Future.parallel(res).map(() => undefined);
    }

    private postDataValues(
        dataSetId: Id,
        dataValues: DataValueToPost[],
        postOptions: { importStrategy: ImportStrategy }
    ): FutureData<void> {
        if (_.isEmpty(dataValues)) return Future.success(undefined);

        const d2DataValues = dataValues.map(
            (dv): D2SetDataValue => ({
                dataElement: dv.dataElementId,
                categoryOptionCombo: dv.categoryOptionComboId,
                value: dv.value || dv.defaultValue || "",
                period: dv.period,
                orgUnit: dv.orgUnitId,
                ...(postOptions.importStrategy === "DELETE" ? { deleted: true } : {}),
            })
        );

        const request: DataValueSetsPostRequest = {
            dataSet: dataSetId,
            dataValues: d2DataValues,
        };

        const res = this.api.dataValues.postSet(postOptions, request);

        return toFuture(res).flatMap(res => {
            const message =
                _(res.conflicts || [])
                    .map(conflict => conflict.value)
                    .compact()
                    .join(", ") || res.description;
            return res.status === "SUCCESS" ? Future.success(undefined) : Future.error(message);
        });
    }
}

type D2SetDataValue = DataValueSetsPostRequest["dataValues"][number];

type ImportStrategy = NonNullable<DataValueSetsPostParams["importStrategy"]>;

function getDataValue(dv: DataValueSetsDataValue): DataValue {
    return {
        orgUnitId: dv.orgUnit,
        dataElementId: dv.dataElement,
        value: dv.value,
        comment: dv.comment,
        period: dv.period,
        categoryOptionComboId: dv.categoryOptionCombo,
    };
}
