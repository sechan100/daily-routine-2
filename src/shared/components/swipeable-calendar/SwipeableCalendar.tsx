/** @jsxImportSource @emotion/react */
import { Day } from "@/shared/period/day";
import { Month } from "@/shared/period/month";
import { useCallback } from "react";
import Calendar from "react-calendar";
import { TileArgs } from "react-calendar/dist/cjs/shared/types";
import { CalendarStyleOptions, useBaseCalendarStyles } from "./calendar-style";




export interface Props {
  month: Month;
  renderTile: (day: Day) => JSX.Element;
  onTileClick?: (day: Day) => void;

  /**
   * tile 비활성화를 위한 함수
   * default: month의 달이 아닌 day는 비활성화
   */
  tileDisabled?: (day: Day) => boolean;

  styleOptions?: CalendarStyleOptions;
}
export const SwipeableCalendar = ({
  month,
  renderTile,
  onTileClick,
  tileDisabled: propsTileDisabled,
  styleOptions,
}: Props) => {
  const calendarStyles = useBaseCalendarStyles(styleOptions ?? {});

  const renderTileContent = useCallback(({ date, view }: { date: Date, view: string }) => {
    if (view !== "month") return null;
    return renderTile(Day.fromJsDate(date));
  }, [renderTile]);

  const onClickDay = useCallback((date: Date) => {
    if (!onTileClick) return;
    onTileClick(Day.fromJsDate(date));
  }, [onTileClick]);

  const tileDisabled = useCallback(({ date }: TileArgs) => {
    // propsTileDisabled가 정의되어 있다면 해당 함수를 사용
    if (propsTileDisabled) {
      return propsTileDisabled(Day.fromJsDate(date));
    }
    // propsTileDisabled가 정의되지 않았다면 기본 동작(해당 달이 아닌 날짜 비활성화)
    else {
      return Day.fromJsDate(date).month !== month.monthNum;
    }
  }, [month.monthNum, propsTileDisabled]);

  return (
    <>
      <Calendar
        calendarType='gregory'
        css={calendarStyles}
        tileContent={renderTileContent}
        defaultValue={month.startDay.getJsDate()}
        allowPartialRange={false}
        // onActiveStartDateChange={onChangeMonth}
        selectRange={false}
        showNavigation={false}
        onClickDay={onClickDay}
        tileDisabled={tileDisabled}
      />
    </>
  )
}