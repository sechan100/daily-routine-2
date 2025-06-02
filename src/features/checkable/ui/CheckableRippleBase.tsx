/** @jsxImportSource @emotion/react */
import { ButtonBase } from "@mui/material";



type Props = {
  children: React.ReactNode;
}
export const CheckableRippleBase = ({
  children,
}: Props) => {

  return (
    <>
      <ButtonBase
        LinkComponent={"div"}
        href='#'
        color='primary'
        css={{
          ".MuiTouchRipple-child": {
            backgroundColor: "var(--color-accent-1) !important",
          },
          width: "100%",
          padding: "0",
          margin: "0",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        {children}
      </ButtonBase>
    </>
  )
}