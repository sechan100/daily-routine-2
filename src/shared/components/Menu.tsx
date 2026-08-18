
/** @jsxImportSource @emotion/react */
import React, { useCallback } from "react";
import { Menu } from "obsidian";
import { Icon } from "./Icon";




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
      onClick={(e) => { void openMenu(e); }}
      className={className}
      css={{
        cursor: "pointer",
      }}
    >
      <Icon size={size} icon={icon} accent={iconAccent} />
    </div>
  )
}