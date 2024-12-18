/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { DailyRoutineBEM, dr } from "@shared/daily-routine-bem"


const bem = dr("task-name");

const baseStyle = css({
  position: "relative",
  cursor: "pointer",
  transition: "color 0.3s ease",
  "&:after": {
    content: "''",
    position: "absolute",
    top: "50%",
    left: 0,
    width: 0,
    height: "1px",
    background: "#9098a9",
  }
})

const chechedStyle = css({
  color: "#9098a9",
  "&:after": {
    width: "100%",
    transition: "all 0.4s ease",
  }
})

interface Props {
  name: string;
  isChecked: boolean;
}
export const CheckableName = ({
  name,
  isChecked
}: Props) => {
  return (
    <span 
      className={bem("name")}
      css={[baseStyle, isChecked && chechedStyle]}
    >
      {name}
    </span>
  )
}