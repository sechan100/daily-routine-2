/** @jsxImportSource @emotion/react */

import { STYLES } from "../styles/styles";
import { TEXT_CSS } from "../styles/text-style";



type Props = {
  error: string | null | undefined;
}
export const ErrorMessage = ({
  error,
}: Props) => {

  if (!error || error.trim() === "") {
    return null;
  }
  return (
    <div css={[
      TEXT_CSS.description,
      {
        color: STYLES.palette.textError,
      }
    ]}>
      {error}
    </div>
  )
}