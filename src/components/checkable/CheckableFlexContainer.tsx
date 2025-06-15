/** @jsxImportSource @emotion/react */
import { checkableStyle } from "./checkable-style";




type Props = {
  children: React.ReactNode;
  excludePadding?: boolean;
}
export const CheckableFlexContainer = ({
  children,
  excludePadding = false,
}: Props) => {
  return (
    <div
      css={{
        // height: checkableStyle.height,
        minHeight: checkableStyle.minHeight,
        display: "flex",
        alignItems: "stretch",
        touchAction: "manipulation",
        userSelect: "none",
        justifyContent: "space-between",
        width: "100%",
        // 왼쪽 padding만 주고, 오른쪽 padding은 dragHandle에서 가지도록 한다. => dragHandle을 쉽게 잡을 수 있도록
        paddingLeft: excludePadding ? undefined : checkableStyle.paddingLeft,
      }}
    >
      {children}
    </div>
  )
}