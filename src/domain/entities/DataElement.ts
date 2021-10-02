import _ from "lodash";
import i18n from "../../locales";
import { Id } from "../../types/d2-api";
import { Maybe, assertUnreachable } from "../../utils/ts-utils";
import { DateObj, dateToString, fromString } from "./DateObj";

interface DataElementBase {
    id: Id;
    code: string;
    name: string;
    description: string;
    // TODO: remove
    visible: boolean;
    status: DataElementStatus;
    comment: Maybe<string>;
}

export type DataElement =
    | DataElementText
    | DataElementBoolean
    | DataElementNumber
    | DataElementDate
    | DataElementOption;

export type DataElementStatus = { type: "enabled" } | { type: "disabled"; reason: string };
export type DataElementId = Id;
export type DataElementCode = string;

export type DataElementType = DataElement["type"];

export interface ValueByType {
    TEXT: string;
    LONG_TEXT: string;
    USERNAME: string;
    BOOLEAN: boolean;
    TRUE_ONLY: boolean;
    NUMBER: number;
    INTEGER: number;
    INTEGER_ZERO_OR_POSITIVE: number;
    PERCENTAGE: number;
    DATE: DateObj;
    OPTION: string;
}

export type DataElementValue = ValueByType[keyof ValueByType];

export interface DataElementText extends DataElementBase {
    type: "TEXT" | "LONG_TEXT" | "USERNAME";
}

export interface DataElementBoolean extends DataElementBase {
    type: "BOOLEAN" | "TRUE_ONLY";
}

export interface DataElementNumber extends DataElementBase {
    type: "NUMBER" | "INTEGER" | "INTEGER_ZERO_OR_POSITIVE" | "PERCENTAGE";
}

export interface DataElementDate extends DataElementBase {
    type: "DATE";
}

export interface DataElementOption extends DataElementBase {
    type: "OPTION";
    options: Option[];
}

export interface Option {
    name: string;
    code: string;
}

// TODO: Move to data layer, string representations are backend-dependent

export type ValueOf<DE extends DataElement> = Maybe<ValueByType[DE["type"]]>;
export type ValueFromType<T extends DataElementType> = Maybe<ValueByType[T]>;

export function getDataElementStringValue<DE extends DataElement>(
    dataElement: DE,
    value: ValueOf<DE>
): string {
    switch (dataElement.type) {
        case "TEXT":
        case "LONG_TEXT":
        case "NUMBER":
        case "INTEGER":
        case "INTEGER_ZERO_OR_POSITIVE":
        case "PERCENTAGE":
        case "BOOLEAN":
        case "OPTION":
        case "USERNAME":
            return value?.toString() || "";
        case "TRUE_ONLY":
            return value === true ? "true" : "";
        case "DATE": {
            return value ? dateToString(value as DateObj) : "";
        }
    }
}

const noErrors = undefined;

export function validateDataElementValue<DE extends DataElement>(
    dataElement: DE,
    value: ValueOf<DE>
): Maybe<string> {
    if (value === undefined || value === "") return noErrors;

    switch (dataElement.type) {
        case "TEXT":
        case "LONG_TEXT":
        case "NUMBER":
        case "DATE":
        case "BOOLEAN":
        case "TRUE_ONLY":
            return noErrors;
        case "PERCENTAGE": {
            const value_ = value as number;
            return value_ >= 0 && value_ <= 100
                ? noErrors
                : i18n.t("Value should be a percentage between 0 and 100");
        }
        case "INTEGER_ZERO_OR_POSITIVE": {
            const value_ = value as number;
            return Math.floor(value_) === value_ && value_ >= 0
                ? noErrors
                : i18n.t("Value should be a positive integer");
        }
        case "INTEGER": {
            const value_ = value as number;
            return Math.floor(value_) === value_ ? noErrors : i18n.t("Value should be an integer");
        }
        case "OPTION": {
            const { options } = dataElement as DataElementOption;
            return _(options).some(option => option.code === value)
                ? noErrors
                : i18n.t(`Invalid option: ${value}`);
        }
    }
}

export function setDataValueComment(dataElement: DataElement, comment: Maybe<string>): DataElement {
    return { ...dataElement, comment };
}

export function getValueFromString<DE extends DataElement>(
    dataElement: DE,
    strValue: Maybe<string>
): ValueOf<DE> {
    if (!strValue) return undefined;

    switch (dataElement.type) {
        case "TEXT":
        case "LONG_TEXT":
        case "USERNAME":
            return strValue as ValueOf<DE>;
        case "BOOLEAN":
            return (strValue === "true" ? true : strValue === "false" ? false : undefined) as ValueOf<DE>;
        case "TRUE_ONLY":
            return (strValue === "true" ? true : undefined) as ValueOf<DE>;
        case "OPTION":
            return strValue as ValueOf<DE>;
        case "PERCENTAGE":
        case "NUMBER":
            return parseFloat(strValue) as ValueOf<DE>;
        case "INTEGER":
        case "INTEGER_ZERO_OR_POSITIVE":
            return parseInt(strValue) as ValueOf<DE>;
        case "DATE":
            return fromString(strValue) as ValueOf<DE>;
        default:
            assertUnreachable(dataElement);
    }
}

export function getDefaultValue(dataElement: DataElement): Maybe<string> {
    switch (dataElement.type) {
        case "OPTION":
            return dataElement.options[0]?.code;
        default:
            return undefined;
    }
}
