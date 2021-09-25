import { Maybe } from "../../utils/ts-utils";

export interface DateObj {
    year: number;
    month: number;
    day: number;
}

export function fromString(s: string): Maybe<DateObj> {
    const [year, month, day] = s.split("-").map(x => parseInt(x));
    return year && month && day ? { year, month, day } : undefined;
}

export function fromJsDate(date: Date): DateObj {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    };
}

export function toJsDate(d: DateObj): Date {
    const date = new Date(Date.UTC(d.year, d.month - 1, d.day));
    return new Date(date.getTime() + date.getTimezoneOffset() * 60e3);
}

export function dateToString(date: DateObj): string {
    const parts = [date.year, date.month.toString().padStart(2, "0"), date.day.toString().padStart(2, "0")];
    return parts.join("-");
}
