import React from "react";

export function useRefresher(): [string, () => void] {
    const [date, setDate] = React.useState(new Date());
    const refresh = React.useCallback(() => {
        setDate(new Date());
    }, [setDate]);

    return [date.getTime().toString(), refresh];
}
