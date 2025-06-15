/** @jsxImportSource @emotion/react */
import { Checkable } from "@/entities/types/checkable";
import { CancelLineName } from "./CancelLineName";
import { Checkbox } from "./Checkbox";




type Props = {
  checkable: Checkable;
}
export const CheckableArea = ({
  checkable
}: Props) => {

  return (
    <div css={{
      display: "flex",
      alignItems: "center",
      justifyContent: "start",
    }}>
      <Checkbox
        state={checkable.state}
        size={13}
        sx={{
          marginRight: "0.5em",
        }}
      />
      <CancelLineName name={checkable.name} cancel={checkable.state !== "unchecked"} />
    </div >
  )
}