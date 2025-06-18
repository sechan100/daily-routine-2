/** @jsxImportSource @emotion/react */
import { Checkable } from "@/entities/types/dr-nodes";
import { CancelLineName } from "./CancelLineName";
import { Checkbox } from "./Checkbox";




type Props = {
  checkable: Checkable;
  disableCheckbox?: boolean;
}
export const CheckableArea = ({
  checkable,
  disableCheckbox = false,
}: Props) => {

  return (
    <div css={{
      display: "flex",
      alignItems: "center",
      justifyContent: "start",
    }}>
      {!disableCheckbox && <Checkbox
        state={checkable.state}
        size={13}
        sx={{
          marginRight: "0.5em",
        }}
      />}
      <CancelLineName name={checkable.name} cancel={checkable.state !== "unchecked"} />
    </div >
  )
}