/** @jsxImportSource @emotion/react */
import { drNodeStyle } from "./dr-node-tyle";




type Props = {
  children: React.ReactNode;
  excludePadding?: boolean;
}
export const DrNodeFlexContainer = ({
  children,
  excludePadding = false,
}: Props) => {
  return (
    <div
      css={{
        // height: checkableStyle.height,
        minHeight: drNodeStyle.minHeight,
        display: "flex",
        alignItems: "stretch",
        touchAction: "manipulation",
        userSelect: "none",
        justifyContent: "space-between",
        width: "100%",
        // 왼쪽 padding만 주고, 오른쪽 padding은 optionIconsContainer에서 처리
        paddingLeft: excludePadding ? undefined : drNodeStyle.paddingLeft,
      }}
    >
      {children}
    </div>
  )
}