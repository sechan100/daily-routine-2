/** @jsxImportSource @emotion/react */
import { TEXT_CSS } from "@shared/constants/text-style";
import { ToggleComponent } from "@shared/components/ToggleComponent";


interface ShowOnCalendarProps {
  value: boolean;
  onChange: (ShowOnCalendar: boolean) => void;
  className?: string;
}
export const ShowOnCalendar = ({
  value,
  onChange,
  className
}: ShowOnCalendarProps) => {
  return (
    <div 
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }} 
      className={className}
    >
      <div css={TEXT_CSS.medium}>ShowOnCalendar</div>
      <ToggleComponent 
        value={value}
        onChange={onChange}
      />
    </div>
  )
}