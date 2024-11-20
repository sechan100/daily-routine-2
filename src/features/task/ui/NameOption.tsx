/** @jsxImportSource @emotion/react */
import { TEXT_CSS } from "@shared/constants/text-style";
import { TextEditComponent } from "@shared/components/TextEditComponent"
import { useMemo } from "react";


interface NameProps {
  value: string;
  onChange: (name: string) => void;
  validation?: {
    isValid: boolean;
    message: string;
  }
  className?: string;
  placeholder?: string;
}
export const Name = ({
  value,
  onChange,
  validation: p_validation,
  className,
  placeholder
}: NameProps) => {
  const validation = useMemo(() => p_validation ?? { isValid: true, message: "" }, [p_validation]);

  return (
    <div 
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }} 
      className={className}
    >
      <div css={TEXT_CSS.medium}>Name</div>
      <div css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "end",
      }}>
        <TextEditComponent
          value={value}
          onChange={name => onChange(name)}
          placeholder={placeholder}
          css={!validation.isValid ? TEXT_CSS.errorColor : null}
        />
        {!validation.isValid && (
          <div css={[TEXT_CSS.description, TEXT_CSS.errorColor]}>{validation.message}</div>
        )}
      </div>
    </div>
  )
}