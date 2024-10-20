/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { TextComponent } from "obsidian";
import { useRef, useState, useEffect } from "react";
import { dr } from "shared/daily-routine-bem";
import { Button } from "./Button";
import clsx from "clsx";










interface TextEditComponentProps {
  value: string;
  onBlur?: (value: string) => void;
  width?: string;
  className?: string;
}
export const TextEditComponent = (props: TextEditComponentProps) => {
  const obsidianTextComponentRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(props.value);

  // Obsidian Component
  useEffect(() => {
    if(!obsidianTextComponentRef.current) return;
    const textComp = new TextComponent(obsidianTextComponentRef.current)
    .setValue(text)
    .onChange((value) => setText(value));
    textComp.inputEl.focus();
    textComp.inputEl.onblur = () => {
      if(props.onBlur) props.onBlur(textComp.getValue());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
  const bem = dr("text-edit");
  return (
    <div 
      className={clsx(props.className, bem(""))}
      css={{
        width: props.width??"auto"
      }}
      ref={obsidianTextComponentRef}
    />
  )
}