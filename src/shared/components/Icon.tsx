
/** @jsxImportSource @emotion/react */
import { getIcon } from "obsidian"
import React, { useEffect, useRef } from "react";



interface IconProps {
  icon: string;
  accent?: boolean;
  color?: string;
  className?: string;
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
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: props.accent ? "var(--interactive-accent)" : props.color,
      }}
    />
  )
})