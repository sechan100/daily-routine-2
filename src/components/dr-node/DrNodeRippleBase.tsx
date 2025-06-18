/** @jsxImportSource @emotion/react */
import { ButtonBase, TouchRippleActions } from '@mui/material';
import { useCallback, useRef } from 'react';



type Props = {
  children: React.ReactNode;
}
export const DrNodeRippleBase = ({
  children,
}: Props) => {
  const touchRippleRef = useRef<TouchRippleActions>(null);

  // touch시에 ripple이 사라지지 않는 버그가 있어서 Actions ref를 사용하여 직접 처리
  const handleTouchEnd = useCallback(() => {
    if (touchRippleRef.current) {
      touchRippleRef.current.stop();
    }
  }, []);

  return (
    <>
      <ButtonBase
        LinkComponent={"div"}
        href='#'
        color='primary'
        onTouchEnd={handleTouchEnd}
        touchRippleRef={touchRippleRef}
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