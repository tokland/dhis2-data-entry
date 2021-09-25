import React from "react";
import styled from "styled-components";
import HelpIcon from "@material-ui/icons/Help";

type DataItem = { description: string };

export interface ItemHelpProps {
    dataItem: DataItem;
}

export const ItemHelp: React.FC<ItemHelpProps> = React.memo(props => {
    const { dataItem } = props;

    return dataItem.description ? (
        <Container title={dataItem.description}>
            <HelpIconStyled fontSize="small" color="primary" />
        </Container>
    ) : null;
});

const Container = styled.span`
    cursor: help;
`;

const HelpIconStyled = styled(HelpIcon)`
    margin-left: 5px;
`;
