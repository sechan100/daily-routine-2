/** @jsxImportSource @emotion/react */
import { TextComponent } from "obsidian";
import { memo, useEffect, useRef } from "react";
import { ErrorMessage } from "./ErrorMessage";










interface TextEditComponentProps {
  value: string;
  name?: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  width?: string;
  error?: string | null | undefined;
  focus?: boolean;
  placeholder?: string;
}
export const TextEditComponent = memo(({
  value,
  name,
  onChange,
  onBlur,
  width,
  error,
  focus = false,
  placeholder
}: TextEditComponentProps) => {
  const obsidianTextComponentRef = useRef<HTMLDivElement>(null);
  const textComponentCreated = useRef(false);

  // Obsidian Component
  useEffect(() => {
    if (!obsidianTextComponentRef.current) return;
    if (textComponentCreated.current) return;
    const textComp = new TextComponent(obsidianTextComponentRef.current)
      .setValue(value)
      .onChange(value => onChange?.(value))
      .setPlaceholder(placeholder ?? "");

    if (name) {
      textComp.inputEl.name = name;
    }

    if (focus) textComp.inputEl.focus();
    textComp.inputEl.onblur = () => {
      if (onBlur) onBlur(textComp.getValue());
    }

    textComponentCreated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div
      css={{
        width: width ?? "auto",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        gap: '4px',
      }}
    >
      <div ref={obsidianTextComponentRef} />
      <ErrorMessage error={error} />
    </div>
  )
})