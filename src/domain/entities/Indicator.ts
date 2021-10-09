import _ from "lodash";
import { formatNumber } from "../../utils/basic";
import { Expression, ExpressionParser, Logical } from "../../utils/expressionParser";
import { Maybe } from "../../utils/ts-utils";
import { Code, Id } from "./Base";
import { Config } from "./Config";
import { DataElementId } from "./DataElement";
import { DataForm, getValue } from "./DataForm";
import { Either } from "./Either";

export type Indicator = StandardIndicator | SqlViewIndicator;

export type IndicatorId = Id;

export interface BaseIndicator {
    id: IndicatorId;
    code: Code;
    name: string;
    description: string;
    decimals: number;
    afterDataElement: Maybe<Code>;
}

export interface StandardIndicator extends BaseIndicator {
    type: "standard";
    expression: string;
}

export interface SqlViewIndicator extends BaseIndicator {
    type: "sqlView";
    sqlViewId: Id;
    dataId: Id;
}

type EvalError = string;

type Values = Record<DataElementId, string>;

const { success, error } = Either;

export function evalIndicatorExpression(
    indicator: StandardIndicator,
    dataForm: DataForm,
    config: Config
): Either<EvalError, string> {
    const values = _(dataForm.dataSet.dataElements)
        .values()
        .map(
            dataElement => [dataElement.id, getValue(dataForm, dataElement)?.toString() || ""] as [Id, string]
        )
        .fromPairs()
        .value();

    return ExpressionParser.parse("indicator", indicator.expression).match({
        success: expressions => {
            return getExpressionsAsString(expressions, values, config)
                .flatMap(strExpression => {
                    return evalJs<number>(strExpression);
                })
                .map(value => formatIndicatorValue(indicator, value));
        },
        error: err => {
            return error(`Formula error: ${err}`);
        },
    });
}

function getExpressionsAsString(
    expressions: Expression[],
    values: Values,
    config: Config,
    options: { emptyValuesAsZeros?: boolean } = {}
): Either<EvalError, string> {
    const strExpressionEs = expressions.map(expression =>
        getExpressionAsString(expression, values, config, options)
    );
    return Either.join(strExpressionEs).map(parts => parts.join(" "));
}

export function formatIndicatorValue(indicator: Indicator, value: number): string {
    const { decimals } = indicator;
    return formatNumber(value, decimals);
}

function getExpressionAsString(
    expression: Expression,
    values: Values,
    config: Config,
    options: { emptyValuesAsZeros?: boolean } = {}
): Either<EvalError, string> {
    const { emptyValuesAsZeros = true } = options;

    switch (expression.type) {
        case "parentheses":
            return success(expression.parentheses);
        case "operator":
            return success(expression.operator);
        case "logical": {
            const jsOperators: Partial<Record<Logical, string>> = { not: "!", and: "&&", or: "||" };
            return success(jsOperators[expression.logical] || expression.logical);
        }
        case "number":
            return success(expression.value.toString());
        case "dataElement": {
            const dataElementId = expression.dataElement;
            if (expression.attributeOptionCombo || expression.categoryOptionCombo) {
                return error(`Data element formulas with disaggregation not implemented`);
            } else if (dataElementId in values) {
                const value = values[expression.dataElement];
                const strValue = emptyValuesAsZeros
                    ? (value || 0).toString()
                    : value === undefined || value === ""
                    ? "undefined"
                    : value;
                return success(strValue);
            } else {
                return error(`Data element not found: ${dataElementId}`);
            }
        }
        case "constant": {
            const constantId = expression.constant;
            const constant = config.constants[constantId];
            return constant ? success(constant.value.toString()) : error(`Constant not found: ${constantId}`);
        }
        case "if": {
            return Either.join([
                getExpressionsAsString(expression.condition, values, config, { emptyValuesAsZeros: false }),
                getExpressionsAsString(expression.valueTrue, values, config),
                getExpressionsAsString(expression.valueFalse, values, config),
            ]).map(([condition = "", valueTrue = "", valueFalse = ""]) => {
                return `((${condition}) ? (${valueTrue}) : (${valueFalse}))`;
            });
        }
        default:
            return error(`Unsupported: ${expression.type}`);
    }
}

function evalJs<Result>(s: string): Either<string, Result> {
    try {
        return success(eval(s) as Result); // eslint-disable-line no-eval
    } catch (err) {
        return error((err as Error).message);
    }
}
