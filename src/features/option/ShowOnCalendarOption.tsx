/** @jsxImportSource @emotion/react */
import { TEXT_CSS } from "@shared/constants/text-style";
import { ToggleComponent } from "@shared/components/ToggleComponent";


interface ShowOnCalendarOptionProps {
  value: boolean;
  onChange: (ShowOnCalendar: boolean) => void;
  className?: string;
}
export const ShowOnCalendarOption = ({
  value,
  onChange,
  className
}: ShowOnCalendarOptionProps) => {
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