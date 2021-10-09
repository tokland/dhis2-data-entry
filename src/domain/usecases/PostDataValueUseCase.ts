import _ from "lodash";
import { DataValueRepository, DataValueToPost } from "../repositories/DataValueRepository";
import { Config } from "../entities/Config";
import { Id } from "../entities/Base";
import { DataElement, getDataElementStringValue, getDefaultValue } from "../entities/DataElement";
import { DataForm, getValue } from "../entities/DataForm";
import { getOrgUnitIdFromPath } from "../entities/OrgUnit";
import { Future } from "../../utils/future";
import { AggregatedDataValueRepository } from "../repositories/AggregatedDataValueRepository";
import { updateDataFormIndicators } from "./indicators";
import { getMessages, Validation } from "../entities/rules/Validation";
import { OrgUnitRepository } from "../repositories/OrgUnitRepository";
import { FutureData } from "../../data/future";
import { validate } from "../entities/rules/FormValidation";

export interface PostDataValueOptions {
    orgUnitPath: Id[];
    period: string;
    dataForm: DataForm;
    dataFormPrev: DataForm;
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

        return validate0({ config, dataForm, period, dataElement, orgUnitId, dataValueRepository }).flatMap(
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

function getDataValueToPost(options: {
    dataForm: DataForm;
    dataElement: DataElement;
    period: string;
    orgUnitId: Id;
}): DataValueToPost {
    const { dataForm, dataElement, period, orgUnitId } = options;

    return {
        period: period,
        orgUnitId,
        dataSetId: dataForm.id,
        dataElementId: dataElement.id,
        value: getDataElementStringValue(dataElement, getValue(dataForm, dataElement)),
        defaultValue: getDefaultValue(dataElement),
    };
}

export function getDataValuesToPost(options: {
    config: Config;
    dataForm: DataForm;
    dataFormPrev: DataForm;
    dataValueRepository: DataValueRepository;
    orgUnitRepository: OrgUnitRepository;
    period: string;
    orgUnitPath: Id[];
}): FutureData<{ dataForm: DataForm; dataValues: DataValueToPost[] }> {
    const { dataForm, dataFormPrev, period, orgUnitPath } = options;

    const orgUnitId = getOrgUnitIdFromPath(orgUnitPath);
    const dataValuesToPost = getDataValuesForDataFormUpdate({
        dataForm: dataFormPrev,
        dataFormUpdated: dataForm,
        period,
        orgUnitId,
    });

    return Future.success({ dataForm, dataValues: dataValuesToPost });
}

function getDataValuesForDataFormUpdate(options: {
    dataForm: DataForm;
    dataFormUpdated: DataForm;
    period: string;
    orgUnitId: string;
}) {
    const { dataForm, dataFormUpdated, period, orgUnitId } = options;

    const dataValuesToPost = _(dataFormUpdated.dataSet.dataElements)
        .values()
        .map(de => (getValue(dataForm, de) !== getValue(dataFormUpdated, de) ? de : null))
        .compact()
        .map(dataElement => getDataValueToPost({ dataForm: dataFormUpdated, dataElement, period, orgUnitId }))
        .value();

    return dataValuesToPost;
}

export function validate0(options: {
    config: Config;
    dataForm: DataForm;
    period: string;
    orgUnitId: Id;
    dataElement: DataElement;
    dataValueRepository: DataValueRepository;
}): Future<PostDataValueError, Validation> {
    return validate(options)
        .mapError(getValidationError)
        .flatMap(validation => {
            const { errors } = getMessages(validation);
            return _.isEmpty(errors)
                ? Future.success(validation)
                : Future.error({ type: "validation", message: errors.join("\n") });
        });
}

export function getValidationError(message: string): PostDataValueError {
    return { type: "validation", message };
}

export function getServerError(message: string): PostDataValueError {
    return { type: "server", message };
}
