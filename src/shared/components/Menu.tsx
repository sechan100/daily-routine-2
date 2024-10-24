
/** @jsxImportSource @emotion/react */
import { MenuItem } from "obsidian";
import React, { useCallback, useMemo } from "react";
import { Menu, getIcon } from "obsidian";
import { Icon } from "./Icon";




interface MenuComponentProps {
  onMenuShow: (menu: Menu) => void;
}
export const MenuComponent = (props: MenuComponentProps) => {

  const openMenu = useCallback((e: React.MouseEvent) => {
    const m = new Menu();
    props.onMenuShow(m);
    m.showAtMouseEvent(e.nativeEvent);
  }, [props]);


  return (
    <div 
      onClick={openMenu}
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <Icon icon="menu" />
    </div>
  )
}