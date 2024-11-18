/** @jsxImportSource @emotion/react */
import { textStyle } from "@shared/components/font";
import { TextEditComponent } from "@shared/components/TextEditComponent"




interface NameProps {
  value: string;
  onChange: (name: string) => void;
  className?: string;
  placeholder?: string;
}
export const Name = ({
  value,
  onChange,
  className,
  placeholder
}: NameProps) => {
  return (
    <div 
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }} 
      className={className}
    >
      <div css={textStyle.medium}>Name</div>
      <TextEditComponent
        value={value}
        onChange={name => onChange(name)}
        placeholder={placeholder}
      />
    </div>
  )
}