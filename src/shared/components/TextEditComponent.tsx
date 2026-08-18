/** @jsxImportSource @emotion/react */
import { TextComponent } from "obsidian";
import { useRef, useEffect, memo } from "react";
import { dr } from "@shared/utils/daily-routine-bem";










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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 마운트 시 한 번만 생성
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