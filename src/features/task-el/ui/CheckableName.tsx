/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { DailyRoutineBEM, dr } from "@shared/daily-routine-bem"


const bem = dr("task-name");

const baseStyle = css({
  position: "relative",
  cursor: "pointer",
  transition: "color 0.5s ease",
  "&:after": {
    content: "''",
    position: "absolute",
    top: "50%",
    left: 0,
    width: 0,
    transform: "translateY(-50%)",
    height: "1.5px", // check 취소선 두께
    background: "var(--color-base-60)", // check 취소선 색
  }
})

const chechedStyle = css({
  color: "#9098a9", // check된 상태에서 글자색
  "&:after": {
    width: "100%",
    transition: "all 0.5s ease",
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