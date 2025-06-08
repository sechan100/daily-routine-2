/** @jsxImportSource @emotion/react */
import { RecurrenceUnitControl, RecurrenceUnitDaysSelector } from "@/features/routine";
import { Modal } from "@/shared/components/modal/styled";
import { Control, useController } from "react-hook-form";
import { RoutineForm } from "../model/routine-form";




type Props = {
  control: Control<RoutineForm>
}
export const ControlledRecurrenceUnitControl = ({
  control,
}: Props) => {
  const {
    field: { onChange: onRecurrenceUnitChange, value: recurrenceUnit },
  } = useController({
    name: 'recurrenceUnit',
    control,
  });
  const { field: { onChange: onDaysOfWeekChange, value: daysOfWeek },
  } = useController({
    name: 'daysOfWeek',
    control,
  });
  const { field: { onChange: onDaysOfMonthChange, value: daysOfMonth },
  } = useController({
    name: 'daysOfMonth',
    control,
  });


  return (
    <>
      <div css={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <Modal.Header name='Recurrence Unit' />
        <RecurrenceUnitControl
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