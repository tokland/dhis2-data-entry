import React from "react";
import { FutureData } from "../../../data/future";
import { User } from "../../../domain/entities/User";
import { PostDataValueOptions, FuturePostDataValue } from "../../../domain/usecases/PostDataValueUseCase";

export interface DataEntryContextState {
    indicatorsKey: string;
    saveDataValue(dataValue: PostDataValueOptions): FuturePostDataValue;
    getUsers(search: string): FutureData<User[]>;
}

export const DataEntryContext = React.createContext<DataEntryContextState | null>(null);

export function useDataEntryContext() {
    const context = React.useContext(DataEntryContext);
    if (!context) throw new Error("App context uninitialized");
    return context;
}
