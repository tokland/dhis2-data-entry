import _ from "lodash";
import { FutureData } from "../../data/future";
import { Future } from "../../utils/future";
import { Id } from "../entities/Base";
import { Config } from "../entities/Config";
import { DataElement, getDataElementStringValue, getDefaultValue } from "../entities/DataElement";
import {
    DataForm,
    updateDataValues,
} from "../entities/DataForm";
import { getOrgUnitIdFromPath } from "../entities/OrgUnit";
import { validate as validateForm } from "../entities/rules/FormValidation";
import { getMessages, Validation } from "../entities/rules/Validation";
import { DataValueRepository, DataValueToPost } from "../repositories/DataValueRepository";
import { OrgUnitRepository } from "../repositories/OrgUnitRepository";
import { PostDataValueError } from "./PostDataValueUseCase";

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
        value: getDataElementStringValue(dataElement),
        defaultValue: getDefaultValue(dataElement),
    };
}

export function getDataValuesToPost(options: {
    config: Config;
    dataForm: DataForm;
    dataValueRepository: DataValueRepository;
    orgUnitRepository: OrgUnitRepository;
    dataElement: DataElement;
    period: string;
    orgUnitPath: Id[];
}): FutureData<{ dataForm: DataForm; dataValues: DataValueToPost[] }> {
    const { dataForm, dataElement, period, orgUnitPath } = options;

    const orgUnitId = getOrgUnitIdFromPath(orgUnitPath);
    const dataValue = getDataValueToPost({ dataForm, dataElement, orgUnitId, period });
    const dataFormUpdated = updateDataValues(dataForm, [dataValue]);
    const dataValuesToPost = getDataValuesForDataFormUpdate({ dataForm, dataFormUpdated, period, orgUnitId });

    return Future.success({ dataForm, dataValues: dataValuesToPost });
}

export function getDataValuesForDataFormUpdate(options: {
    dataForm: DataForm;
    dataFormUpdated: DataForm;
    period: string;
    orgUnitId: string;
}) {
    const { dataForm, dataFormUpdated, period, orgUnitId } = options;

    const oldValues = _(dataForm.dataElements)
        .values()
        .map(de => [de.id, de.value] as [Id, typeof de.value])
        .fromPairs()
        .value();

    const dataValuesToPost = _(dataFormUpdated.dataElements)
        .values()
        .map(de => (oldValues[de.id] !== de.value ? de : null))
        .compact()
        .map(dataElement => getDataValueToPost({ dataForm, dataElement, period, orgUnitId }))
        .value();

    return dataValuesToPost;
}

export function validate(options: {
    config: Config;
    dataForm: DataForm;
    period: string;
    orgUnitId: Id;
    dataElement: DataElement;
    dataValueRepository: DataValueRepository;
}): Future<PostDataValueError, Validation> {
    return validateForm(options)
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
