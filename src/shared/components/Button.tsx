/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";







interface ButtonProps {
  variant?: "primary" | "danger";
  width?: string;
  height?: string;
  fontSize?: string;
}
export const Button = styled.button<ButtonProps>`
  cursor: pointer;
  ${p => p.width ? `width: ${p.width};` : ""}
  ${p => p.height ? `height: ${p.height};` : ""}
  ${p => p.fontSize ? `font-size: ${p.fontSize};` : ""}
  color: ${p => {
    const variant = p.variant??'primary';
    switch(p.variant){
      case "primary": return "black";
      case "danger": return "var(--color-red)";
    }
  }}
`;