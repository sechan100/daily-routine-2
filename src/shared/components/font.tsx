/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";



const bold = css({
  fontWeight: "var(--font-bold)"
})

const medium = css({
  color: "var(--text-normal)",
  fontSize: "var(--font-ui-medium)",
})

const large = css({
  color: "var(--text-normal)",
  fontSize: "var(--font-ui-large)"
})

const description = css({
  color: "var(--text-muted)",
  fontSize: "var(--font-ui-smaller)",
  paddingTop: "var(--size-4-1)",
  lineHeight: "var(--line-height-tight)"
})

export const textStyle = {
  bold,
  medium,
  large,
  description
}