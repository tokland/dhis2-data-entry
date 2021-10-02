import _ from "lodash";
import { FutureData } from "../../../data/future";
import { Future } from "../../../utils/future";
import { Id } from "../Base";
import { Config } from "../Config";
import { DataElement, DataElementCode, validateDataElementValue } from "../DataElement";
import { DataForm, getValue } from "../DataForm";
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
}

export function validate(options: {
    config: Config;
    dataForm: DataForm;
    period: string;
    orgUnitId: Id;
    dataElement: DataElement;
}): Validation$ {
    const { config, dataForm, dataElement } = options;
    const { validations } = dataForm.logic;

    const baseError = validateDataElementValue(dataElement, getValue(dataForm, dataElement));
    if (baseError) return validationError(baseError);

    const validationsForDataElement = validations.filter(validation =>
        validation.dataElement
            ? validation.dataElement === dataElement.code
            : validation.shouldValidate?.({ config, dataElement })
    );

    const dataElements = getDataElementsFromDataForm(dataForm);

    const validateOptions: ValidateOptions = { dataElement, dataElements };
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
