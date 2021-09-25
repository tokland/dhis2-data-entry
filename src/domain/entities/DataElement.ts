import _ from "lodash";
import i18n from "../../locales";
import { Id } from "../../types/d2-api";
import { Maybe, assertUnreachable } from "../../utils/ts-utils";
import { DateObj, dateToString, fromString } from "./DateObj";

interface DataElementBase {
    id: Id;
    code: string;
    name: string;
    comment: Maybe<string>;
    visible: boolean;
    status: DataElementStatus;
    description: string;
}

export type DataElementStatus = { type: "enabled" } | { type: "disabled"; reason: string };

export type DataElementId = Id;
export type DataElementCode = string;

export type DataElement =
    | DataElementText
    | DataElementBoolean
    | DataElementNumber
    | DataElementDate
    | DataElementOption;

export type DataElementType = DataElement["type"];

export interface DataElementText extends DataElementBase {
    type: "TEXT" | "LONG_TEXT" | "USERNAME";
    value: Maybe<string>;
}

export interface DataElementBoolean extends DataElementBase {
    type: "BOOLEAN" | "TRUE_ONLY";
    value: Maybe<boolean>;
}

export interface DataElementNumber extends DataElementBase {
    type: "NUMBER" | "INTEGER" | "INTEGER_ZERO_OR_POSITIVE" | "PERCENTAGE";
    value: Maybe<number>;
}

export interface DataElementDate extends DataElementBase {
    type: "DATE";
    value: Maybe<DateObj>;
}

export interface DataElementOption extends DataElementBase {
    type: "OPTION";
    options: Option[];
    value: Maybe<string>;
}

export interface Option {
    name: string;
    code: string;
}

export function getDataElementStringValue(dataElement: DataElement): string {
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
            return dataElement.value?.toString() || "";
        case "TRUE_ONLY":
            return dataElement.value === true ? "true" : "";
        case "DATE": {
            const date = dataElement.value;
            return date ? dateToString(date) : "";
        }
    }
}

const noErrors = undefined;

export function validateDataElementValue<DE extends DataElement>(dataElement: DE, value: DE["value"]): Maybe<string> {
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
            return value_ >= 0 && value_ <= 100 ? noErrors : i18n.t("Value should be a percentage between 0 and 100");
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
            return _(options).some(option => option.code === value) ? noErrors : i18n.t(`Invalid option: ${value}`);
        }
    }
}

export function setDataValue<DE extends DataElement>(dataElement: DE, value: DE["value"]): DE {
    return { ...dataElement, value };
}

export function setDataValueComment(dataElement: DataElement, comment: Maybe<string>): DataElement {
    return { ...dataElement, comment };
}

export function setDataElementValueFromString<DE extends DataElement>(dataElement: DE, strValue: string): DE {
    const value = getValueFromString<DE>(dataElement.type, strValue);
    return setDataValue(dataElement, value);
}

export function getValueFromString<DE extends DataElement>(
    type: DataElement["type"],
    strValue: string | undefined
): DE["value"] {
    if (!strValue) return undefined;

    switch (type) {
        case "TEXT":
        case "LONG_TEXT":
        case "USERNAME":
            return strValue;
        case "BOOLEAN":
            return strValue === "true" ? true : strValue === "false" ? false : undefined;
        case "TRUE_ONLY":
            return strValue === "true" ? true : undefined;
        case "OPTION":
            return strValue;
        case "PERCENTAGE":
        case "NUMBER":
            return parseFloat(strValue);
        case "INTEGER":
        case "INTEGER_ZERO_OR_POSITIVE":
            return parseInt(strValue);
        case "DATE":
            return fromString(strValue);
        default:
            assertUnreachable(type);
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
