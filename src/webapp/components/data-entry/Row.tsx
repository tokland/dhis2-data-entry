import styled from "styled-components";

export const Row = styled.div<{ even: boolean }>`
    background-color: ${props => (props.even ? "rgb(241, 241, 241)" : undefined)};
    padding: 8px;
    display: flex;
    flex-wrap: wrap;
`;
