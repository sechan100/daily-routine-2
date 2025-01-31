/** @jsxImportSource @emotion/react */
import { Icon } from "@shared/components/Icon";
import { MenuComponent } from "@shared/components/Menu";
import { Menu } from "obsidian";



interface OptionIconProps {
  onOptionMenu: (m: Menu) => void | Promise<void>;
}
export const OptionIcon = ({
  onOptionMenu,
}: OptionIconProps) => {
  return (
    <MenuComponent
      onMenuShow={onOptionMenu}
      icon="ellipsis"
      css={{
        color: 'var(--color-base-40)',
        width: "3em",
      }}
    />
  )
}