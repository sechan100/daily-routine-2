/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";



const baseStyle = css({
  position: "relative",
  cursor: "pointer",
  transition: "color 0.5s ease",
  wordBreak: "break-word",
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
}
export const CancelLineName = ({
  name,
  cancel,
}: Props) => {
  return (
    <span css={[baseStyle, cancel && cancelTextStyle && cancelLineStyle]}>
      {name}
    </span>
  )
}