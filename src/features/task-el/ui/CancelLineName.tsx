/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { dr } from "@shared/utils/daily-routine-bem";


const bem = dr("task-name");

const baseStyle = css({
  position: "relative",
  cursor: "pointer",
  transition: "color 200ms ease-out",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
  // 취소선: width 대신 scaleX로 키워서 체크/해제 양쪽 모두 부드럽게 움직인다.
  "&:after": {
    content: "''",
    position: "absolute",
    top: "50%",
    insetInlineStart: 0,
    width: "100%",
    transform: "translateY(-50%) scaleX(0)",
    transformOrigin: "left center",
    transition: "transform 200ms ease-out",
    height: "1.5px", // check 취소선 두께
    background: "var(--text-muted)", // check 취소선 색
  },
  // 오른쪽→왼쪽 언어에서는 취소선이 글자의 시작(오른쪽)부터 그어진다.
  ".mod-rtl &::after": {
    transformOrigin: "right center",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:after": {
      transition: "none",
    },
  },
})

// check된 상태: 글자를 흐리게 하고 취소선을 긋는다.
const cancelStyle = css({
  color: "var(--text-muted)",
  "&:after": {
    transform: "translateY(-50%) scaleX(1)",
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
    <span
      className={bem("name")}
      dir="auto"
      css={[baseStyle, cancel && cancelStyle]}
    >
      {name}
    </span>
  )
}
