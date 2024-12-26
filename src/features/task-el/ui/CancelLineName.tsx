/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { dr } from "@shared/utils/daily-routine-bem";


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

const cancelTextStyle = css({
  color: "var(--color-base-35)", // check된 상태에서 글자색
})

const cancelLineStyle = css({
  color: "var(--color-base-40)",
  "&:after": {
    width: "100%",
    transition: "all 0.5s ease",
  }
})

interface Props {
  name: string;
  cancel: boolean;
  transparentLine?: boolean;
}
export const CancelLineName = ({
  name,
  cancel,
  transparentLine
}: Props) => {
  return (
    <span 
      className={bem("name")}
      css={[baseStyle, cancel && cancelTextStyle, cancel && !transparentLine && cancelLineStyle]}
    >
      {name}
    </span>
  )
}