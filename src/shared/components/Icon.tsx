
/** @jsxImportSource @emotion/react */
import { getIcon } from "obsidian"
import React, { useEffect, useRef } from "react";



interface IconProps {
  icon: string;
  size?: string;
  accent?: boolean;
  color?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}
export const Icon = React.memo((props: IconProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if(!ref.current) return;
    const el = ref.current;
    const svg = getIcon(props.icon);
    if(!svg) return;
    el.appendChild(svg);
    return () => {
      el.removeChild(svg);
    }
  }, [props]);
  
  return (
    <span
      className={props.className}
      ref={ref}
      onClick={props.onClick}
      css={{
        ...(props.size && {"--icon-size": props.size}),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: props.accent ? "var(--interactive-accent)" : props.color,
      }}
    />
  )
})