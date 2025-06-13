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
        padding: excludePadding ? undefined : checkableStyle.padding,
      }}
    >
      {children}
    </div>
  )
}