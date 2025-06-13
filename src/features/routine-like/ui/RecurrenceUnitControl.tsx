/** @jsxImportSource @emotion/react */
import { RecurrenceUnit } from "@/entities/routine";
import { Modal } from "@/shared/components/modal/styled-modal";
import { DayOfWeek } from "@/shared/period/day";
import { RecurrenceUnitButtons } from "./RecurrenceUnitButtons";
import { RecurrenceUnitDaysSelector } from "./RecurrenceUnitDaysSelector";




type Props = {
  recurrenceUnit: RecurrenceUnit;
  onRecurrenceUnitChange: (unit: RecurrenceUnit) => void;
  daysOfWeek: DayOfWeek[];
  onDaysOfWeekChange: (days: DayOfWeek[]) => void;
  daysOfMonth: number[];
  onDaysOfMonthChange: (days: number[]) => void;
}
export const RecurrenceUnitControl = ({
  recurrenceUnit,
  onRecurrenceUnitChange,
  daysOfWeek,
  onDaysOfWeekChange,
  daysOfMonth,
  onDaysOfMonthChange,
}: Props) => {

  return (
    <>
      <div css={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <Modal.Header name='Recurrence Unit' />
        <RecurrenceUnitButtons
          recurrenceUnit={recurrenceUnit}
          onRecurrenceUnitChange={onRecurrenceUnitChange}
        />
      </div>
      <RecurrenceUnitDaysSelector
        recurrenceUnit={recurrenceUnit}
        daysOfWeek={daysOfWeek}
        onDaysOfWeekChange={onDaysOfWeekChange}
        daysOfMonth={daysOfMonth}
        onDaysOfMonthChange={onDaysOfMonthChange}
      />
    </>
  )
}