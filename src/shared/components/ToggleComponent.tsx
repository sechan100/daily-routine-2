/** @jsxImportSource @emotion/react */
import { dr } from "@shared/daily-routine-bem";
import clsx from "clsx";
import { ToggleComponent as ObsidianToggleComponent } from "obsidian";
import { memo, useEffect, useRef } from "react";


interface ToggleComponentProps {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}
export const ToggleComponent = memo(({
  value,
  onChange,
  className
}: ToggleComponentProps) => {
  const obsidianToggleComponentRef = useRef<HTMLDivElement>(null);
  const isComponentCreated = useRef(false);

  // Obsidian Component Creation And Linking With React
  useEffect(() => {
    if(!obsidianToggleComponentRef.current) return;
    if(isComponentCreated.current) return;

    new ObsidianToggleComponent(obsidianToggleComponentRef.current)
    .setValue(value)
    .onChange(onChange)
    
    isComponentCreated.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
  const bem = dr("toggle");
  return (
    <div 
      className={clsx(className, bem(""))}
      ref={obsidianToggleComponentRef}
    />
  )
})