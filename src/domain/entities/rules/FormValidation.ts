import _ from "lodash";
import { FutureData } from "../../../data/future";
import i18n from "../../../locales";
import { Future } from "../../../utils/future";
import { Maybe } from "../../../utils/ts-utils";
import { Id } from "../Base";
import { Config } from "../Config";
import { DataElement, DataElementCode, validateDataElementValue } from "../DataElement";
import { DataForm } from "../DataForm";
import { DataValueWithCode } from "../DataValue";
import { getDataElementsFromDataForm } from "../Rule";
import { buildValidationError, Validation } from "./Validation";

export interface FormValidation<DEKey extends string = string> {
    shouldValidate?(options: { dataElement: DataElement; config: Config }): boolean;
    dataElement?: DataElementCode;
    validate(options: ValidateOptions<DEKey>): Validation$;
}

export type Validation$ = FutureData<Validation>;

interface ValidateOptions<DEKey extends string = string> {
    dataElement: DataElement;
    dataElements: Record<DEKey, DataElement>;
    initialDataValues: DataValueWithCode[];
}

export function validate(options: {
    config: Config;
    dataForm: DataForm;
    period: string;
    orgUnitId: Id;
    dataElement: DataElement;
}): Validation$ {
    const { config, dataForm, dataElement } = options;
    const { initialDataValues } = dataForm;
    const { validations } = dataForm.logic;

    const baseError = validateDataElementValue(dataElement, dataElement.value);
    if (baseError) return validationError(baseError);

    const validationsForDataElement = validations.filter(validation =>
        validation.dataElement
            ? validation.dataElement === dataElement.code
            : validation.shouldValidate?.({ config, dataElement })
    );

    const dataElements = getDataElementsFromDataForm(dataForm);

    const validateOptions: ValidateOptions = { dataElement, dataElements, initialDataValues };
    const results$ = validationsForDataElement.map(validation => validation.validate(validateOptions));

    return Future.parallel(results$).map(_.flatten);
}

export const noErrors: Validation$ = Future.success([]);

export function validationError(message: string): Validation$ {
    return Future.success([buildValidationError(message)]);
}

export function validationWarning(message: string): Validation$ {
    return Future.success([{ type: "warning", message }]);
}

export function validateMinValue<DEKey extends string>(
    dataElementCode: string,
    minValue: number
): FormValidation<DEKey> {
    return {
        dataElement: dataElementCode,
        validate({ dataElement }) {
            const value = dataElement.value as Maybe<number>;
            const isValid = value === undefined || value >= minValue;
            return isValid ? noErrors : validationError(i18n.t("Min value is {{minValue}}", { minValue }));
        },
    };
}

export function validateMaxValue<DEKey extends string>(
    dataElementCode: string,
    maxValue: number
): FormValidation<DEKey> {
    return {
        dataElement: dataElementCode,
        validate({ dataElement }) {
            const value = dataElement.value as Maybe<number>;
            const isValid = value === undefined || value <= maxValue;
            return isValid ? noErrors : validationError(i18n.t("Max value is {{maxValue}}", { maxValue }));
        },
    };
}
