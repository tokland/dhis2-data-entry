import _ from "lodash";
import { DataValueRepository } from "../repositories/DataValueRepository";
import { FutureData } from "../../data/future";
import { Config } from "../entities/Config";
import { DataForm } from "../entities/DataForm";
import { OrgUnit } from "../entities/OrgUnit";
import { Future } from "../../utils/future";
import { OrgUnitRepository } from "../repositories/OrgUnitRepository";
import { AggregatedDataValueRepository } from "../repositories/AggregatedDataValueRepository";
import { updateDataFormIndicators } from "./indicators";
import { DataSet } from "../entities/DataSet";
import { getValueFromString } from "../entities/DataElement";

interface Options {
    dataSet: DataSet;
    orgUnit: OrgUnit;
    period: string;
}

export class GetDataFormUseCase {
    constructor(
        private config: Config,
        private dataValueRepository: DataValueRepository,
        private aggregatedDataValueRepository: AggregatedDataValueRepository,
        private orgUnitRepository: OrgUnitRepository
    ) {}

    execute(options: Options): FutureData<DataForm> {
        const { config, dataValueRepository, aggregatedDataValueRepository } = this;
        const { dataSet, orgUnit, period } = options;
        const orgUnitId = orgUnit.id;

        const dataValues$ = dataValueRepository.get({
            orgUnitIds: [orgUnitId],
            dataSetIds: [dataSet.id],
            periods: [period],
        });

        return Future.joinObj({ dataValues: dataValues$ }).flatMap(({ dataValues }) => {
            const infoByDataElementId = _(dataValues)
                .map(dv => {
                    const dataElement = dataSet.dataElements[dv.dataElementId];
                    if (!dataElement) return undefined;
                    const value = getValueFromString(dataElement, dv.value);
                    const comment = dv.comment;
                    const obj = { value, comment };
                    return [dataElement.id, obj] as [typeof dataElement.id, typeof obj];
                })
                .compact()
                .fromPairs()
                .value();

            const dataForm: DataForm = {
                dataSet,
                period,
                orgUnit,
                values: _.mapValues(infoByDataElementId, val => val.value),
                comments: _.mapValues(infoByDataElementId, val => val.comment),
                dataElementsStatus: {},
                indicatorsStatus: {},
                indicatorValues: {},
                constants: {},
            };

            return updateDataFormIndicators({ config, aggregatedDataValueRepository, dataForm: dataForm });
        });
    }
}
