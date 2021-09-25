import { LinearProgress } from "@material-ui/core";
import MUITreeItem from "@material-ui/lab/TreeItem";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { TreeViewOptions } from "./TreeView";
import { TreeViewNode } from "./TreeViewNode";

export interface TreeItemProps {
    className?: string;
    node: TreeViewNode;
    findNodes: (ids: string[]) => Promise<TreeViewNode[]>;
    options: TreeViewOptions;
}

const BaseTreeItem: React.FC<TreeItemProps> = ({ className, node, findNodes, options }) => {
    const [children, setChildren] = useState<TreeViewNode[]>([]);
    const { maxLevel } = options;
    const maxLevelReached = maxLevel !== undefined && node.level >= maxLevel;
    const [loading, setLoading] = useState<boolean>(!maxLevelReached);

    useEffect(() => {
        if (maxLevelReached) return;

        const ids = node.children.map(({ id }) => id);

        findNodes(ids).then(children => {
            setChildren(children);
            setLoading(false);
        });
    }, [node, findNodes, maxLevelReached]);

    const overrideIcon = maxLevelReached ? <NoIcon /> : undefined;

    return (
        <MUITreeItem
            className={className}
            nodeId={node.id}
            label={<TreeItemLabel text={node.name} loading={loading} />}
            collapseIcon={overrideIcon}
            expandIcon={overrideIcon}
        >
            {children.map(subnode => (
                <TreeItem key={subnode.id} node={subnode} findNodes={findNodes} options={options} />
            ))}
        </MUITreeItem>
    );
};

const NoIcon: React.FC = () => null;

export const TreeItem = styled(BaseTreeItem)`
    text-decoration: ${props => (props.node.strikeout ? "line-through" : "inherit")};
`;

const TreeItemLabel: React.FC<{ text: string; loading?: boolean }> = ({ text, loading }) => {
    return (
        <div data-test-loading={(loading || false).toString()}>
            {text}
            {loading && <LinearProgress />}
        </div>
    );
};
