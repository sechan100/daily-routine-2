
/** @jsxImportSource @emotion/react */
import { getIcon } from "obsidian"
import React, { useEffect, useRef } from "react";



interface IconProps {
  icon: string;
  size?: string;
  accent?: boolean;
  color?: string;
  className?: string;
  // onClick이 있을 때 버튼의 접근성 이름(Obsidian이 hover tooltip으로도 보여준다)
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
}
export const Icon = React.memo((props: IconProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const clickable = !!props.onClick;

  useEffect(() => {
    if(!ref.current) return;
    const el = ref.current;
    const svg = getIcon(props.icon);
    if(!svg) return;
    el.appendChild(svg);
    return () => {
      el.removeChild(svg);
    }
  }, [props.icon, clickable]);

  const style = {
    ...(props.size && {"--icon-size": props.size}),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: props.accent ? "var(--interactive-accent)" : props.color,
  };

  // 클릭 가능한 아이콘은 Obsidian 표준 icon button(hover 상태 포함)으로 그린다.
  if(clickable){
    return (
      <button
        type="button"
        className={props.className ? `clickable-icon ${props.className}` : "clickable-icon"}
        ref={ref}
        aria-label={props.ariaLabel}
        onClick={props.onClick}
        css={style}
      />
    )
  }

  return (
    <span
      className={props.className}
      ref={ref}
      css={style}
    />
  )
})
