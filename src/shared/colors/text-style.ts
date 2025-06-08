/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { STYLES } from "./styles";



export const TEXT_CSS = {
  bold: css({
    color: STYLES.palette.textNormal,
    fontWeight: STYLES.fontWeight.bold,
  }),

  medium: css({
    color: STYLES.palette.textNormal,
    fontSize: STYLES.fontSize.medium,
  }),

  large: css({
    color: STYLES.palette.textNormal,
    fontSize: STYLES.fontSize.large,
  }),

  description: css({
    color: STYLES.palette.textMuted,
    fontSize: STYLES.fontSize.smaller,
    lineHeight: STYLES.lineHeight.tight,
  }),
}