/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { useMemo } from "react";







interface StyledButtonProps {
  variant?: "primary" | "destructive" | "accent" | "disabled";
  width?: string;
  height?: string;
  fontSize?: string;
}
const StyledButton = styled.button<StyledButtonProps>`
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
        `background-color: var(--interactive-accent) !important;
        color: var(--text-on-accent) !important;
        `);
      case "disabled": return (
        `background-color: var(--base-30) !important;
        &:hover {
          cursor: not-allowed;
        }
        `
      );
    }
  }}
`;


type ButtonProps = StyledButtonProps &  React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}
export const Button = (props: ButtonProps) => {
  const variant = useMemo(() => {
    if(props.disabled) return "disabled";
    if(props.accent) return "accent";
    return props.variant??'primary';
  }, [props.accent, props.disabled, props.variant]);

  return (
    <StyledButton 
      {...props}
      className={props.className}
      variant={variant}
    >
      {props.children}
    </StyledButton>
  )
}