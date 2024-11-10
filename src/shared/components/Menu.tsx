
/** @jsxImportSource @emotion/react */
import { MenuItem } from "obsidian";
import React, { useCallback, useMemo } from "react";
import { Menu, getIcon } from "obsidian";
import { Icon } from "./Icon";




interface MenuComponentProps {
  onMenuShow: (menu: Menu) => void;
  icon?: string;
  iconAccent?: boolean;
}
export const MenuComponent = ({
  onMenuShow,
  icon = "menu",
  iconAccent = false
}: MenuComponentProps) => {

  const openMenu = useCallback((e: React.MouseEvent) => {
    const m = new Menu();
    onMenuShow(m);
    m.showAtMouseEvent(e.nativeEvent);
  }, [onMenuShow]);


  return (
    <div 
      onClick={openMenu}
      css={{
        cursor: "pointer",
      }}
    >
      <Icon icon={icon} accent={iconAccent} />
    </div>
  )
}