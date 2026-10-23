
/** @jsxImportSource @emotion/react */
import React, { useCallback } from "react";
import { Menu } from "obsidian";
import { Icon } from "./Icon";


type OnMenuShow = (menu: Menu) => void | Promise<void>;

// 마우스 이벤트 위치에 띄우거나, 마우스가 없으면(키보드) 요소의 영역 아래에 띄운다.
// popout window는 전역 클래스가 달라 instanceof를 못 쓰므로 구분 키로 판별한다.
// doc: 요소가 속한 document. popout window에서 메뉴가 메인 창에 뜨지 않도록 넘긴다.
export type MenuAnchor = { mouseEvent: MouseEvent } | { rect: DOMRect; doc: Document };

/**
 * 메뉴를 만들어 띄운다. onMenuShow(비동기일 수 있음)가 끝난 뒤에 보여준다.
 */
export const showMenu = async (onMenuShow: OnMenuShow | undefined, anchor: MenuAnchor) => {
  const m = new Menu();
  try {
    onMenuShow && await onMenuShow(m);
  } catch (error) {
    console.error(error);
    return;
  }
  if("mouseEvent" in anchor){
    m.showAtMouseEvent(anchor.mouseEvent);
  } else {
    const { rect, doc } = anchor;
    m.showAtPosition({ x: rect.left, y: rect.bottom, width: rect.width, overlap: true }, doc);
  }
}


interface MenuComponentProps {
  onMenuShow?: OnMenuShow;
  className?: string;
  icon?: string;
  size?: string;
  iconAccent?: boolean;
  ariaLabel?: string;
}
export const MenuComponent = ({
  onMenuShow,
  className,
  icon = "menu",
  size,
  iconAccent = false,
  ariaLabel,
}: MenuComponentProps) => {

  const openMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // await 이후에는 currentTarget이 비워지므로 미리 읽어둔다.
    const rect = e.currentTarget.getBoundingClientRect();
    const doc = e.currentTarget.ownerDocument;
    // detail === 0: 키보드(Enter/Space)로 발생한 click. 마우스 좌표가 없다.
    const anchor: MenuAnchor = e.detail === 0 ? { rect, doc } : { mouseEvent: e.nativeEvent };
    void showMenu(onMenuShow, anchor);
  }, [onMenuShow]);


  return (
    <button
      type="button"
      onClick={openMenu}
      className={className ? `clickable-icon ${className}` : "clickable-icon"}
      aria-label={ariaLabel}
      aria-haspopup="menu"
    >
      <Icon size={size} icon={icon} accent={iconAccent} />
    </button>
  )
}
