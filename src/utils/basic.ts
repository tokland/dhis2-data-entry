export function valueIf<T>(condition: boolean, valueFn: () => T): T | undefined {
    return condition ? valueFn() : undefined;
}

export function formatNumber(value: number, decimals: number): string {
    return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function getDefaultPeriod(): string {
    return new Date().getFullYear().toString();
}
