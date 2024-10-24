/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";







interface ButtonProps {
  variant?: "primary" | "destructive" | "accent";
  width?: string;
  height?: string;
  fontSize?: string;
}
export const Button = styled.button<ButtonProps>`
  cursor: pointer;
  ${p => p.width ? `width: ${p.width};` : ""}
  ${p => p.height ? `height: ${p.height};` : ""}
  ${p => p.fontSize ? `font-size: ${p.fontSize};` : ""}
  ${p => {
    const variant = p.variant??'primary';
    switch(p.variant){
      case "primary": return "color: black";
      case "destructive": return "color: var(--text-error) !important";
      case "accent": return (
        `color: var(--text-on-accent) !important;
        background-color: var(--interactive-accent) !important;
        `);
    }
  }}
`;