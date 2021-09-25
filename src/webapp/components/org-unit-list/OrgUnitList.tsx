import React, { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { Id } from "../../../domain/entities/Base";
import { OrgUnit } from "../../../domain/entities/OrgUnit";
import { useAppContext } from "../../contexts/app-context";
import { TreeView, TreeViewOptions } from "../tree-view/TreeView";
import { TreeViewNode } from "../tree-view/TreeViewNode";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { useCallbackEffect } from "../../hooks/use-callback-effect";

interface OrgUnitListProps {
    onSelectedOrgUnit?: (orgUnit: OrgUnit) => void;
    refreshKey?: Date;
    selected?: Id;
    closedOrgUnitsVisibility?: Visibility;
    treeViewOptions: TreeViewOptions;
    rootIds: Id[];
}

type Visibility = "hidden" | "default" | "strikeout";

export const OrgUnitList: React.FC<OrgUnitListProps> = React.memo(props => {
    const {
        onSelectedOrgUnit,
        refreshKey,
        selected,
        treeViewOptions,
        closedOrgUnitsVisibility = "hidden",
        rootIds,
    } = props;
    const { compositionRoot } = useAppContext();
    const [roots, setOrgUnitRoots] = useState<TreeViewNode[]>([]);
    const snackbar = useSnackbar();

    const findOrgUnit = useCallback(
        (ids: string[]) => {
            return compositionRoot.orgUnits.getByIds
                .execute(ids)
                .map(orgUnits => buildNodes(orgUnits, { closedOrgUnitsVisibility }))
                .toPromise(msg => new Error(msg));
        },
        [compositionRoot, closedOrgUnitsVisibility]
    );

    useEffect(() => {
        compositionRoot.orgUnits.getByIds.execute(rootIds).run(
            orgUnits => setOrgUnitRoots(buildNodes(orgUnits, { closedOrgUnitsVisibility })),
            err => snackbar.error(err)
        );
    }, [compositionRoot, refreshKey, closedOrgUnitsVisibility, snackbar, rootIds]);

    const selectOrgUnit = React.useCallback(
        (orgUnitId: Id | undefined) => {
            if (!onSelectedOrgUnit || !orgUnitId) return;

            return compositionRoot.orgUnits.getById.execute(orgUnitId).run(
                orgUnit => (orgUnit ? onSelectedOrgUnit(orgUnit) : null),
                err => snackbar.error(err)
            );
        },
        [compositionRoot, onSelectedOrgUnit, snackbar]
    );

    const notifyOrgUnitSelection = useCallbackEffect(selectOrgUnit);

    React.useEffect(() => {
        selectOrgUnit(roots[0]?.id);
    }, [selectOrgUnit, roots]);

    return (
        <Container data-test-org-unit-list>
            {roots.map(root => (
                <TreeView
                    key={`tree-${root.id}`}
                    root={root}
                    findNodes={findOrgUnit}
                    onNodeSelect={notifyOrgUnitSelection}
                    defaultSelected={selected}
                    options={treeViewOptions}
                />
            ))}
        </Container>
    );
});

function buildNodes(orgUnits: OrgUnit[], options: { closedOrgUnitsVisibility: Visibility }): TreeViewNode[] {
    return _(orgUnits)
        .map(orgUnit => buildNode(orgUnit, options))
        .compact()
        .value();
}

function buildNode(orgUnit: OrgUnit, options: { closedOrgUnitsVisibility: Visibility }): TreeViewNode | null {
    const { id, name, children, closedDate, level } = orgUnit;
    const isClosed = closedDate ? new Date() > closedDate : false;
    const strikeout = options.closedOrgUnitsVisibility === "strikeout" && isClosed;
    const isHidden = options.closedOrgUnitsVisibility === "hidden" && isClosed;

    return isHidden ? null : { id, name, children, strikeout, level };
}

const Container = styled.div`
    display: block;
    width: 100%;
    overflow: auto;
    padding: 10px;
`;
