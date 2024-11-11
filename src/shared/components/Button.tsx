/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useMemo } from "react";








interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "destructive" | "accent" | "disabled";
}

export const Button = (props: ButtonProps) => {

  const variantStyle = useMemo(() => {
    switch(props.variant){
      // PRIMARY
      case "primary": return css({
        color: "black"
      });
      // DESTRUCTIVE
      case "destructive": return css({
        color: "var(--text-error) !important"
      })
      // ACCENT
      case "accent": return css({
        backgroundColor: "var(--interactive-accent) !important",
        color: "var(--text-on-accent) !important"
      })
      // DISABLED
      case "disabled": return css({
        backgroundColor: "var(--base-30) !important",
        "&:hover": {
          cursor: "not-allowed"
        }
      })
    }
  }, [props.variant]);


  return (
    <button {...props}
      css={[
        {
          cursor: "pointer",
        },
        variantStyle
      ]}
    >
    </button>
  )
}