/** @jsxImportSource @emotion/react */
import { ToggleComponent as ObsidianToggleComponent } from "obsidian";
import { memo, useEffect, useRef } from "react";


interface ToggleComponentProps {
  value: boolean;
  onChange: (value: boolean) => void;
}
export const ToggleComponent = memo(({
  value,
  onChange,
}: ToggleComponentProps) => {
  const obsidianToggleComponentRef = useRef<HTMLDivElement>(null);
  const isComponentCreated = useRef(false);

  // Obsidian Component Creation And Linking With React
  useEffect(() => {
    if (!obsidianToggleComponentRef.current) return;
    if (isComponentCreated.current) return;

    new ObsidianToggleComponent(obsidianToggleComponentRef.current)
      .setValue(value)
      .onChange(onChange)

    isComponentCreated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={obsidianToggleComponentRef}
    />
  )
})