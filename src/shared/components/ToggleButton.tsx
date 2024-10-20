/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Button } from "./Button";







interface ActiveButtonProps {
  active: boolean;
}
export const ActiveButton = styled(Button)<ActiveButtonProps>`
  ${ p => p.active ? `
    background-color: var(--color-accent-1) !important;
    color: var(--text-on-accent) !important;
    ` : ""
  }
`;