export type Matcher<Value extends { type: Type }, Result, Type extends string> = {
    [K in Type]: (value: Extract<Value, { type: K }>) => Result;
};

export function match<Value extends { type: Type }, Result, Type extends string = Value["type"]>(
    value: Extract<Value, { type: Type }>,
    matcher: Matcher<Value, Result, Type>
): Result {
    const fn = matcher[value.type];
    return fn(value);
}
