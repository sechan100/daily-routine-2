/** @jsxImportSource @emotion/react */
import { RecurrenceUnit } from "@/entities/types/routine";
import { Button } from "@/shared/components/Button";


type RecurrenceUnitControlProps = {
  recurrenceUnit: RecurrenceUnit;
  onRecurrenceUnitChange: (unit: RecurrenceUnit) => void;
}
export const RecurrenceUnitButtons = ({
  recurrenceUnit,
  onRecurrenceUnitChange,
}: RecurrenceUnitControlProps) => {

  return (
    <div>
      <Button
        css={{ marginRight: "0.5em" }}
        variant={recurrenceUnit === "week" ? "accent" : "primary"}
        onClick={() => onRecurrenceUnitChange("week")}
      >
        Week
      </Button>
      <Button
        variant={recurrenceUnit === "month" ? "accent" : "primary"}
        onClick={() => onRecurrenceUnitChange("month")}
      >
        Month
      </Button>
    </div>
  )
}