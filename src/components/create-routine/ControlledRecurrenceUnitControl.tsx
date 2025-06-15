import { Control, useController } from "react-hook-form";
import { RecurrenceUnitControl } from "../routine/RecurrenceUnitControl";
import { CreateRoutineForm } from "./create-routine-form";




type Props = {
  control: Control<CreateRoutineForm>
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
      <RecurrenceUnitControl
        recurrenceUnit={recurrenceUnit}
        onRecurrenceUnitChange={onRecurrenceUnitChange}
        daysOfWeek={daysOfWeek}
        onDaysOfWeekChange={onDaysOfWeekChange}
        daysOfMonth={daysOfMonth}
        onDaysOfMonthChange={onDaysOfMonthChange}
      />
    </>
  )
}