import { css } from "@emotion/react";



export const checkableStyle = {
  height: "2.5em",
  padding: "0 0.8em",
  baseStyle: css({
    position: "relative",
    "& *": {
      touchAction: "manipulation",
      userSelect: "none",
    },
    "&::after": {
      content: "''",
    }
  })
}