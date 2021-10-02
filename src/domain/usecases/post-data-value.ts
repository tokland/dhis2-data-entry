import _ from "lodash";
import { FutureData } from "../../data/future";
import { Future } from "../../utils/future";
import { getId, Id } from "../entities/Base";
import { Config } from "../entities/Config";
import { DataElement, getDataElementStringValue, getDefaultValue } from "../entities/DataElement";
import {
    DataForm,
    isOrgUnitAssignedToDataForm,
    updateDataValues,
    updateDataValuesWithoutProcessing,
    updateInitialDataValues,
} from "../entities/DataForm";
import { DataValueWithCode, getDataValueId, getDataValuesWithCode } from "../entities/DataValue";
import { getOrgUnitIdFromPath, OrgUnitPath } from "../entities/OrgUnit";
import { applyRulesToDataForm } from "../entities/Rule";
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
    const { config, dataForm, dataElement, period, orgUnitPath } = options;
    const { dataValueRepository, orgUnitRepository } = options;

    const orgUnitId = getOrgUnitIdFromPath(orgUnitPath);
    const dataValue = getDataValueToPost({ dataForm, dataElement, orgUnitId, period });
    const dataFormUpdated = updateDataValues(dataForm, [dataValue]);
    const dataValuesToPost = getDataValuesForDataFormUpdate({ dataForm, dataFormUpdated, period, orgUnitId });
    const dataValues = dataValuesToPost;

    const afterSave = dataForm.logic.processDataFormsAfterSave?.({
        config,
        orgUnitPath,
        dataElement,
        period,
    });
    const dataForms = afterSave ? afterSave.dataForms : [];

    return getDataValuesForDataForms({
        config,
        dataValueRepository,
        orgUnitRepository,
        dataForms: _.uniqBy(dataForms, getId),
        period,
        orgUnitPath,
        dataValuesPending: dataValues,
    }).map(relatedDataValues => ({
        dataValues: _.concat(dataValues, relatedDataValues),
        dataForm: dataFormUpdated,
    }));
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

export function getDataValuesForDataForms(options: {
    config: Config;
    dataForms: DataForm[];
    period: string;
    orgUnitPath: OrgUnitPath;
    dataValuesPending: DataValueToPost[];
    dataValueRepository: DataValueRepository;
    orgUnitRepository: OrgUnitRepository;
}): FutureData<DataValueToPost[]> {
    const { config, dataForms, period, orgUnitPath, dataValuesPending } = options;
    const { dataValueRepository, orgUnitRepository } = options;

    if (_.isEmpty(dataForms)) return Future.success([]);

    const mainOrgUnitId = getOrgUnitIdFromPath(orgUnitPath);

    const relatedDataValues$ = dataValueRepository
        .getForChildren({
            period,
            orgUnitId: mainOrgUnitId,
            dataSetIds: dataForms.map(getId),
        })
        // Data values still pending to be posted should take precedence over the persisted
        .map(dataValues => {
            return _.uniqBy([...dataValuesPending, ...dataValues], getDataValueId);
        });

    const [orgUnitIds = [], dataSetIds = []] = _(dataForms)
        .flatMap(dataForm => dataForm.logic.getInitialDataValues?.({ config, orgUnitPath }) || [])
        .map(info => [info.orgUnitId, info.dataSetId] as [Id, Id])
        .unzip()
        .value();

    const relatedInitialDataValues$ = dataValueRepository
        .get({ periods: [period], orgUnitIds: _.uniq(orgUnitIds), dataSetIds: _.uniq(dataSetIds) })
        .map(savedDataValues => _.uniqBy([...dataValuesPending, ...savedDataValues], getDataValueId));

    const childrenOrgUnits$ = orgUnitRepository.getChildren(mainOrgUnitId);

    const dataValuesToPost$ = Future.joinObj({
        relatedDataValues: relatedDataValues$,
        relatedInitialDataValues: relatedInitialDataValues$,
        childrenOrgUnits: childrenOrgUnits$,
    }).map(({ relatedDataValues, relatedInitialDataValues, childrenOrgUnits }) => {
        return _.flatMap(_.uniqBy(dataForms, getId), dataForm => {
            const childOrgUnitIds = _.intersection(Array.from(dataForm.organisationUnits), childrenOrgUnits.map(getId));

            return _.flatMap(Array.from(childOrgUnitIds), childOrgUnitId => {
                if (!isOrgUnitAssignedToDataForm(dataForm, childOrgUnitId)) return [];

                const dataElementIds = new Set(_.keys(dataForm.dataElements));
                const relatedDataValues2 = relatedDataValues.filter(
                    dv => dataElementIds.has(dv.dataElementId) && dv.orgUnitId === childOrgUnitId
                );

                const initialDataValues: DataValueWithCode[] = getDataValuesWithCode(
                    config.dataElements,
                    relatedInitialDataValues
                );

                const dataFormWithValues = updateDataValuesWithoutProcessing(dataForm, relatedDataValues2);

                const initialDataForm = updateInitialDataValues(
                    dataFormWithValues,
                    config.dataElements,
                    initialDataValues
                );

                const dataFormUpdated = applyRulesToDataForm(initialDataForm);

                return getDataValuesForDataFormUpdate({
                    dataForm: initialDataForm,
                    dataFormUpdated,
                    orgUnitId: childOrgUnitId,
                    period,
                });
            });
        });
    });

    return dataValuesToPost$;
}
