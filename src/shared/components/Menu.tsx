
/** @jsxImportSource @emotion/react */
import { Menu } from "obsidian";
import React, { useCallback } from "react";
import { ObsidianIcon } from "./ObsidianIcon";




interface MenuComponentProps {
  onMenuShow?: (menu: Menu) => void | Promise<void>;
  className?: string;
  icon?: string;
  size?: string;
  iconAccent?: boolean;
}
export const MenuComponent = ({
  onMenuShow,
  className,
  icon = "menu",
  size,
  iconAccent = false,
}: MenuComponentProps) => {

  const openMenu = useCallback(async (e: React.MouseEvent) => {
    const m = new Menu();
    onMenuShow && await onMenuShow(m);
    m.showAtMouseEvent(e.nativeEvent);
  }, [onMenuShow]);


  return (
    <div
      onClick={openMenu}
      className={className}
      css={{
        cursor: "pointer",
      }}
    >
      <ObsidianIcon size={size} icon={icon} accent={iconAccent} />
    </div>
  )
}