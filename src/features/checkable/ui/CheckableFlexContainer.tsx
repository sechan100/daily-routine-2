/** @jsxImportSource @emotion/react */
import { checkableConfig } from "../config/checkable-config";




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
        height: checkableConfig.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: excludePadding ? undefined : checkableConfig.padding,
      }}
    >
      {children}
    </div>
  )
}