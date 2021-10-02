import { DataValueRepository } from "../repositories/DataValueRepository";
import { Config } from "../entities/Config";
import { Id } from "../entities/Base";
import { DataElement } from "../entities/DataElement";
import { DataForm } from "../entities/DataForm";
import { getOrgUnitIdFromPath } from "../entities/OrgUnit";
import { getDataValuesToPost, getServerError, validate } from "./post-data-value";
import { Future } from "../../utils/future";
import { AggregatedDataValueRepository } from "../repositories/AggregatedDataValueRepository";
import { updateDataFormIndicators } from "./indicators";
import { Validation } from "../entities/rules/Validation";
import { OrgUnitRepository } from "../repositories/OrgUnitRepository";

export interface PostDataValueOptions {
    orgUnitPath: Id[];
    period: string;
    dataForm: DataForm;
    dataElement: DataElement;
}

export interface PostDataValueOptions {
    orgUnitPath: Id[];
    period: string;
    dataForm: DataForm;
    dataElement: DataElement;
}

export type PostDataValueError = { type: "server" | "validation"; message: string };

export type PostDataValueSuccess = { dataForm: DataForm; validation: Validation };

export type FuturePostDataValue = Future<PostDataValueError, PostDataValueSuccess>;

// TODO: Unify all PostDataValue use cases
export class PostDataValueUseCase {
    constructor(
        private config: Config,
        private dataValueRepository: DataValueRepository,
        private aggregatedDataValueRepository: AggregatedDataValueRepository,
        private orgUnitRepository: OrgUnitRepository
    ) {}

    execute(options: PostDataValueOptions): FuturePostDataValue {
        const { config, dataValueRepository, orgUnitRepository, aggregatedDataValueRepository } = this;
        const { dataElement, dataForm, period, orgUnitPath } = options;
        const orgUnitId = getOrgUnitIdFromPath(orgUnitPath);

        return validate({ config, dataForm, period, dataElement, orgUnitId, dataValueRepository }).flatMap(
            validation => {
                return getDataValuesToPost({ ...options, config, dataValueRepository, orgUnitRepository })
                    .mapError(getServerError)
                    .flatMap(({ dataValues: allDataValues, dataForm: dataFormUpdated }) => {
                        return this.dataValueRepository
                            .postValues({ dataValues: allDataValues })
                            .mapError(getServerError)
                            .map(() => dataFormUpdated)
                            .flatMap(dataFormUpdate => {
                                return updateDataFormIndicators({
                                    config,
                                    aggregatedDataValueRepository,
                                    period,
                                    orgUnitPath,
                                    dataForm: dataFormUpdate,
                                }).mapError(getServerError);
                            });
                    })
                    .map(dataForm => ({ dataForm, validation }));
            }
        );
    }
}
