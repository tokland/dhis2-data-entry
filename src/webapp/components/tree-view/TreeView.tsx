import React from "react";
import _ from "lodash";
import MUITreeView from "@material-ui/lab/TreeView";
import OpenIcon from "@material-ui/icons/ChevronRight";
import CloseIcon from "@material-ui/icons/ExpandMore";
import styled from "styled-components";

import { TreeItem } from "./TreeItem";
import { TreeViewNode } from "./TreeViewNode";

export interface TreeViewProps {
    className?: string;
    root: TreeViewNode;
    findNodes: (ids: string[]) => Promise<TreeViewNode[]>;
    onNodeSelect?: (id: string) => void;
    defaultSelected?: string;
    options: TreeViewOptions;
}

export interface TreeViewOptions {
    maxLevel?: number;
    initialExpandedUntilLevel?: number;
}

const BaseTreeView: React.FC<TreeViewProps> = React.memo(props => {
    const { className, root, findNodes, onNodeSelect, defaultSelected, options } = props;
    const { initialExpandedUntilLevel } = options;

    const selectNode = React.useCallback(
        (_ev: React.ChangeEvent<{}>, id: string) => {
            if (onNodeSelect) onNodeSelect(id);
        },
        [onNodeSelect]
    );

    const defaultExpanded = React.useMemo(() => {
        if (initialExpandedUntilLevel === undefined) return undefined;

        return _.concat(
            root.level < initialExpandedUntilLevel ? [root.id] : [],
            root.level + 1 < initialExpandedUntilLevel ? root.children.map(ou => ou.id) : []
        );
    }, [root, initialExpandedUntilLevel]);

    return (
        <MUITreeView
            className={className}
            defaultCollapseIcon={CollapseIcon}
            defaultExpandIcon={ExpandIcon}
            selected={defaultSelected || ""}
            defaultExpanded={defaultExpanded}
            onNodeSelect={selectNode}
        >
            <TreeItem node={root} findNodes={findNodes} options={options} />
        </MUITreeView>
    );
});

const CollapseIcon = <CloseIcon />;

const ExpandIcon = <OpenIcon />;

export const TreeView = styled(BaseTreeView)`
    flex-grow: 1;
    padding: 10px;
`;
