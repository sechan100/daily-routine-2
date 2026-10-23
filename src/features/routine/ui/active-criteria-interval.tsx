/** @jsxImportSource @emotion/react */
import { useCallback, useState } from "react";
import { Button } from "@shared/components/Button";
import { TEXT_CSS } from "@shared/components/text-style";
import { Day } from "@shared/period/day";
import { RoutineProperties } from "@entities/routine";
import { formatFullDate, t } from "@shared/i18n";


// 입력칸이 문장 가운데에 들어가므로, 번역 문장을 입력칸 자리 기준으로 앞뒤로 나눠서 그린다. (언어마다 어순이 다르다)
const INPUT_SLOT = "\u0000";

interface IntervalOptionProps {
  className?: string;
  intervalDays: number;
  intervalStart: string;
  setProperties: (properties: Partial<RoutineProperties>) => void;
}
export const IntervalOption = ({ className, intervalDays, intervalStart, setProperties }: IntervalOptionProps) => {
  // 입력을 지우고 다시 쓸 수 있도록, 입력 중인 문자열은 따로 들고 있는다.
  const [text, setText] = useState(Number.isNaN(intervalDays) ? "" : String(intervalDays));

  const onIntervalDaysChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    // 비었거나 1 미만·정수가 아닌 값도 그대로 올린다. 저장 가능 여부는 getActiveCriteriaError가 판단한다.
    setProperties({ intervalDays: value.trim() === "" ? NaN : Number(value) });
  }, [setProperties]);

  const onStartTodayClick = useCallback(() => {
    setProperties({ intervalStart: Day.today().format() });
  }, [setProperties]);

  const [labelBefore, labelAfter] = t("tasks.interval.every", { input: INPUT_SLOT }).split(INPUT_SLOT);
  // 저장되는 값은 YYYY-MM-DD이고, 화면에는 사용자 언어의 날짜로 보여준다.
  const startText = Day.isValidFormat(intervalStart) ? formatFullDate(Day.fromString(intervalStart)) : intervalStart;

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
        {/* 영어 문장이 오른쪽에서 왼쪽으로 쓰는 앱에서 어순이 뒤섞이지 않도록 문장 방향을 문장 내용에서 정한다. */}
        <label dir="auto" css={TEXT_CSS.medium}>
          {labelBefore}
          <input
            type="number"
            min={1}
            step={1}
            value={text}
            onChange={onIntervalDaysChange}
            css={{
              width: "60px",
              // 입력칸 앞뒤의 띄어쓰기는 번역 문장에 들어 있다.
              margin: "0 0.2em",
              textAlign: "center",
            }}
          />
          {labelAfter}
        </label>
      </div>
      <div
        css={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5em",
          paddingTop: "0.7em",
        }}
      >
        <span dir="auto" css={TEXT_CSS.description}>{t("tasks.interval.startDate", { date: startText })}</span>
        <Button
          variant={Day.today().format() === intervalStart ? "accent" : "primary"}
          onClick={onStartTodayClick}
        >
          {t("tasks.interval.startToday")}
        </Button>
      </div>
    </div>
  );
};
