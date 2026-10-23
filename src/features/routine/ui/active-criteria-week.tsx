/** @jsxImportSource @emotion/react */
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@shared/components/Button";
import { DayOfWeek, Day } from "@shared/period/day";
import { RoutineProperties } from "@entities/routine";
import { formatDayOfWeek } from "@shared/i18n";
import { allShortWeekdayLabels, pickWeekdayStyle, WeekdayLabelStyle } from "@shared/components/swipeable-calendar/weekday-labels";


// 요일 단추 하나의 지름(px)과 글꼴 크기(부모 글꼴 크기의 배수)
const BUTTON_SIZE = 47;
const BUTTON_FONT_EM = 0.7;

/**
 * 단추 너비는 고정이라, 짧은 요일 이름이 긴 언어(아랍어 등)는 이름이 단추를 넘친다. 이름이 안 들어가면 한 글자 이름으로 바꾼다.
 */
const useWeekdayLabelStyle = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<WeekdayLabelStyle>("short");

  useLayoutEffect(() => {
    const parentFontSize = wrapperRef.current ? parseFloat(getComputedStyle(wrapperRef.current).fontSize) : NaN;
    const fontSize = Number.isFinite(parentFontSize) ? parentFontSize * BUTTON_FONT_EM : undefined;
    setStyle(pickWeekdayStyle(allShortWeekdayLabels(), BUTTON_SIZE, fontSize));
  }, []);

  return { wrapperRef, style };
}


interface WeekOptionProps {
  className?: string;
  daysOfWeek: DayOfWeek[];
  setProperties: (properties: Partial<RoutineProperties>) => void;
}
export const WeekOption = ({ className, daysOfWeek, setProperties }: WeekOptionProps) => {
  const { wrapperRef, style: labelStyle } = useWeekdayLabelStyle();

  const toggleDOW = useCallback((dow: DayOfWeek) => {
    const isContain = daysOfWeek.includes(dow);
    if(isContain) {
      setProperties({ daysOfWeek: daysOfWeek.filter(d => d !== dow) });
    }
    else {
      setProperties({ daysOfWeek: [...daysOfWeek, dow] });
    }
  }, [daysOfWeek, setProperties]);

  const onDayClick = useCallback((dow: DayOfWeek) => {
    toggleDOW(dow);
  }, [toggleDOW]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      css={{
        display: "flex",
        justifyContent: "end",
        alignItems: "center",
        width: "100%",
        gap: "1em",
        ".is-phone &": {
          justifyContent: "space-between",
          gap: 0,
        }
      }}
    >
      {Day.getDaysOfWeek().map((dow, idx) => {
        const isActive = daysOfWeek.includes(dow);
        return (
          <Button
            key={idx}
            css={{
              fontSize: `${BUTTON_FONT_EM}em`,
              width: `${BUTTON_SIZE}px`,
              height: `${BUTTON_SIZE}px`,
              border: "1px solid var(--color-base-50)",
              borderRadius: "50%",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => onDayClick(dow)}
            variant={isActive ? "accent" : "primary"}
            aria-label={formatDayOfWeek(dow, "long")}
            aria-pressed={isActive}
          >
            {formatDayOfWeek(dow, labelStyle)}
          </Button>
        );
      })}
    </div>
  );
};
