/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { TextComponent } from "obsidian";
import { useRef, useState, useEffect, memo } from "react";
import { dr } from "@shared/daily-routine-bem";
import { Button } from "./Button";
import clsx from "clsx";










interface TextEditComponentProps {
  value: string;
  onChange: (value: string) => void;

  onBlur?: (value: string) => void;
  width?: string;
  focus?: boolean;
  className?: string;
  placeholder?: string;
}
export const TextEditComponent = memo((props: TextEditComponentProps) => {
  const obsidianTextComponentRef = useRef<HTMLDivElement>(null);
  const textComponentCreated = useRef(false);

  // Obsidian Component
  useEffect(() => {
    if(!obsidianTextComponentRef.current) return;
    if(textComponentCreated.current) return;
    const textComp = new TextComponent(obsidianTextComponentRef.current)
    .setValue(props.value)
    .onChange(props.onChange)
    .setPlaceholder(props.placeholder??"")

    if(props.focus) textComp.inputEl.focus();
    textComp.inputEl.onblur = () => {
      if(props.onBlur) props.onBlur(textComp.getValue());
    }
    
    textComponentCreated.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
  const bem = dr("text-edit");
  return (
    <div 
      className={bem("", "", props.className)}
      css={{
        width: props.width??"auto"
      }}
      ref={obsidianTextComponentRef}
    />
  )
})