/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";



export const TEXT_CSS = {
  bold: css({
    fontWeight: "var(--font-bold)"
  }),

  medium: css({
    color: "var(--text-normal)",
    fontSize: "var(--font-ui-medium)",
  }),

  large: css({
    color: "var(--text-normal)",
    fontSize: "var(--font-ui-large)"
  }),

  description: css({
    color: "var(--text-muted)",
    fontSize: "var(--font-ui-smaller)",
    paddingTop: "var(--size-4-1)",
    lineHeight: "var(--line-height-tight)"
  }),

  errorColor: css({
    color: "var(--text-error)"
  })
}