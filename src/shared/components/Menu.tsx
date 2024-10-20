import { MenuItem } from "obsidian";
import React, { useCallback, useMemo } from "react";
import { Menu, getIcon } from "obsidian";




interface MenuComponentProps {
  width?: number;
  height?: number;
  onMenuShow: (menu: Menu) => void;
}
export const MenuComponent = (props: MenuComponentProps) => {

  const openMenu = useCallback((e: React.MouseEvent) => {
    const m = new Menu();
    props.onMenuShow(m);
    m.showAtMouseEvent(e.nativeEvent);
  }, [props]);


  return (
    <div onClick={openMenu}>
      <svg xmlns="http://www.w3.org/2000/svg" width={props.width??24} height={props.height??24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
        <line x1="4" x2="20" y1="12" y2="12"/>
        <line x1="4" x2="20" y1="6" y2="6"/>
        <line x1="4" x2="20" y1="18" y2="18"/>
      </svg>
    </div>
  )
}