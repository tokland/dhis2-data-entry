import { HashRouter, Route, Switch } from "react-router-dom";
import { DataEntryPage } from "./DataEntryPage";

export const Router = () => {
    return (
        <HashRouter>
            <Switch>
                <Route render={() => <DataEntryPage />} />
            </Switch>
        </HashRouter>
    );
};
