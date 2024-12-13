/** @jsxImportSource @emotion/react */
import { Icon } from "@shared/components/Icon";



interface OptionIconProps {
  onClick: () => void;
}
export const OptionIcon = ({
  onClick,
}: OptionIconProps) => {
  return (
    <div
      onClick={onClick}
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexGrow: "1",
        width: "3em",
        alignSelf: "stretch"
      }}
    >
      <Icon icon="ellipsis" color='var(--color-base-40)' />
    </div>
  )
}