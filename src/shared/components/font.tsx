/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from "@emotion/react";



const medium = css`
  color: var(--text-normal);
  font-size: var(--font-ui-medium);
`


const mediumBold = css`
  ${medium}
  font-weight: var(--font-semibold);
`


const description = css`
  color: var(--text-muted);
  font-size: var(--font-ui-smaller);
  padding-top: var(--size-4-1);
  line-height: var(--line-height-tight);
`

export const textCss = {
  medium,
  mediumBold,
  description
}