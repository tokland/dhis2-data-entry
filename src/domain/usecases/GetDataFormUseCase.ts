import { DataValueRepository } from "../repositories/DataValueRepository";
import { FutureData } from "../../data/future";
import { Config } from "../entities/Config";
import { DataForm, updateDataValues } from "../entities/DataForm";
import { OrgUnit } from "../entities/OrgUnit";
import { Future } from "../../utils/future";
import { OrgUnitRepository } from "../repositories/OrgUnitRepository";
import { AggregatedDataValueRepository } from "../repositories/AggregatedDataValueRepository";
import { updateDataFormIndicators } from "./indicators";

interface Options {
    dataForm: DataForm;
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
        const { dataForm, orgUnit, period } = options;
        const orgUnitId = orgUnit.id;

        const dataValues$ = dataValueRepository.get({
            orgUnitIds: [orgUnitId],
            dataSetIds: [dataForm.dataSet.id],
            periods: [period],
        });

        return Future.joinObj({ dataValues: dataValues$ }).flatMap(({ dataValues }) => {
            const dataForm3 = updateDataValues(dataForm, dataValues);

            return updateDataFormIndicators({
                config,
                aggregatedDataValueRepository,
                period,
                orgUnitPath: orgUnit.path,
                dataForm: dataForm3,
            });
        });
    }
}
