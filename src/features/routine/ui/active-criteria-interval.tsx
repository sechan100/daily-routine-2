/** @jsxImportSource @emotion/react */
import { useCallback } from "react";
import { Button } from "@shared/components/Button";
import { TEXT_CSS } from "@shared/components/text-style";
import { Day } from "@shared/period/day";
import { RoutineProperties } from "@entities/routine";


interface IntervalOptionProps {
  className?: string;
  intervalDays: number;
  intervalStart: string;
  setProperties: (properties: Partial<RoutineProperties>) => void;
}
export const IntervalOption = ({ className, intervalDays, intervalStart, setProperties }: IntervalOptionProps) => {

  const onIntervalDaysChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if(isNaN(parsed)) return;
    setProperties({ intervalDays: Math.max(1, Math.floor(parsed)) });
  }, [setProperties]);

  const onStartTodayClick = useCallback(() => {
    setProperties({ intervalStart: Day.today().format() });
  }, [setProperties]);

  return (
    <div
      className={className}
      css={{
        width: "100%",
      }}
    >
      <div
        css={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label css={TEXT_CSS.medium}>
          Every
          <input
            type="number"
            min={1}
            step={1}
            value={intervalDays}
            onChange={onIntervalDaysChange}
            css={{
              width: "60px",
              margin: "0 0.5em",
              textAlign: "center",
            }}
          />
          day(s)
        </label>
      </div>
      <div
        css={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "0.7em",
        }}
      >
        <span css={TEXT_CSS.description}>Starts on {intervalStart}</span>
        <Button
          variant={Day.today().format() === intervalStart ? "accent" : "primary"}
          onClick={onStartTodayClick}
        >
          Start today
        </Button>
      </div>
    </div>
  );
};
