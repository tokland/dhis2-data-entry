import { Box } from "@material-ui/core";
import React from "react";
import styled from "styled-components";

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}

export const TabPanel: React.FC<TabPanelProps> = React.memo(props => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    <Container>{children}</Container>
                </Box>
            )}
        </div>
    );
});

const Container = styled.div`
    margin: 8px;
`;
