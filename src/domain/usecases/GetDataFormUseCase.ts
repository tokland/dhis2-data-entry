import _ from "lodash";
import { DataValueRepository } from "../repositories/DataValueRepository";
import { FutureData } from "../../data/future";
import { Config } from "../entities/Config";
import { DataForm, updateDataValues, updateInitialDataValues } from "../entities/DataForm";
import { OrgUnit } from "../entities/OrgUnit";
import { DataValue } from "../entities/DataValue";
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
            dataSetIds: [dataForm.id],
            periods: [period],
            //attributeOptionComboIds: [config.categoryOptionCombos.default.id],
        });

        const initialDataValues$ = this.getInitialDataValues(options);

        const childrenOrgUnits$ = this.orgUnitRepository.getChildren(orgUnitId);

        return Future.joinObj({
            dataValues: dataValues$,
            initialDataValues: initialDataValues$,
            childrenOrgUnits: childrenOrgUnits$,
        }).flatMap(({ dataValues, initialDataValues, childrenOrgUnits }) => {
            const dataForm2: DataForm = {
                ...updateInitialDataValues(dataForm, config.dataElements, initialDataValues),
                childrenOrgUnits,
            };

            const dataForm3 = updateDataValues(dataForm2, dataValues);

            return updateDataFormIndicators({
                config,
                aggregatedDataValueRepository,
                period,
                orgUnitPath: orgUnit.path,
                dataForm: dataForm3,
            });
        });
    }

    getInitialDataValues(options: Options): FutureData<DataValue[]> {
        const { config, dataValueRepository } = this;
        const { dataForm, orgUnit, period } = options;
        const orgUnitPath = orgUnit.path;

        if (dataForm.logic.getInitialDataValues) {
            const dataValuesOptions = dataForm.logic.getInitialDataValues({ config, orgUnitPath });
            const orgUnitIds = _.uniq(dataValuesOptions.map(opt => opt.orgUnitId));
            const dataSetIds = _.uniq(dataValuesOptions.map(opt => opt.dataSetId));

            return dataValueRepository.get({
                orgUnitIds,
                dataSetIds,
                periods: [period],
                //attributeOptionComboIds: [config.categoryOptionCombos.default.id],
            });
        } else {
            return Future.success([]);
        }
    }
}
