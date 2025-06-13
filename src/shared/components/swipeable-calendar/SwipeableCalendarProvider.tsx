/** @jsxImportSource @emotion/react */
import { Month } from "@/shared/period/month";
import { useCallback, useMemo, useState } from "react";
import { VirtualSwiper } from '../SwiperComponent';
import { SwipeableCalendarCalendarNav } from "./SwipeablecalendarNav";
import { SwipeableCalendarContext, SwipeableCalendarContextType } from "./swipeable-calendar-context";



const loadMonths = (month: Month) => {
  return [
    month.subtract_cpy(1),
    month,
    month.add_cpy(1)
  ];
}

const loadEdgeMonth = (edge: "start" | "end", month: Month) => {
  if (edge === "start") {
    return month.subtract_cpy(1);
  } else {
    return month.add_cpy(1);
  }
};

const getKey = (month: Month) => month.startDay.format()


interface Props {
  /**
   * children 함수를 사용하여 각 달에 해당하는 Calendar 컴포넌트를 반환한다.
   */
  children: (month: Month, index?: number) => React.ReactNode;

  /**
   * calendar 각 tile의 높이
   */
  tileHeight: number;

  /**
   * calendar의 weekdays 표시가 있는 칸의 높이
   * default: 40px
   */
  weekdaysHeight?: number;

  /**
   * calendar의 weekdays 표시가 있는 칸의 padding y
   * default: 10px
   */
  weekdaysPaddingY?: number;

  /**
   * 시작 달을 지정한다.
   * default: 현재 달
  */
  defaultMonth?: Month;

  onMonthChange?: (month: Month) => void;
}
export const SwipeableCalendarProvider = ({
  children,
  tileHeight,
  weekdaysHeight = 40,
  weekdaysPaddingY = 10,
  defaultMonth = Month.now(),
  onMonthChange
}: Props) => {
  const [months, setMonths] = useState<Month[]>(loadMonths(defaultMonth));
  const [activeMonth, setActiveMonth] = useState<Month>(defaultMonth);

  const context = useMemo<SwipeableCalendarContextType>(() => ({
    tileHeight,
    weekdaysHeight,
    weekdaysPaddingY
  }), [tileHeight, weekdaysHeight, weekdaysPaddingY]);

  const calendarHeight = useMemo(() => {
    const weekdaysH = weekdaysHeight + weekdaysPaddingY * 2;
    const calendarH = weekdaysH + tileHeight * 6; // 최대 row가 6(한 달에 6주까지 가능함)
    return weekdaysH + calendarH;
  }, [tileHeight, weekdaysHeight, weekdaysPaddingY]);

  const onSlideChange = useCallback((month: Month) => {
    setActiveMonth(month);
    onMonthChange?.(month);
  }, [onMonthChange]);


  const resetMonths = useCallback((month: Month) => {
    setMonths(loadMonths(month));
    onSlideChange(month);
  }, [onSlideChange]);


  return (
    <SwipeableCalendarContext.Provider value={context} >
      <div
        css={{
          position: 'relative',
          height: `calc(var(--input-height) + ${calendarHeight}px)`,
          overflow: 'hidden',
          width: "100%",
        }}
      >
        <SwipeableCalendarCalendarNav
          month={activeMonth}
          setMonth={resetMonths}
        />
        <VirtualSwiper
          datas={months}
          getKey={getKey}
          loadEdgeData={loadEdgeMonth}
          onSlideChange={onSlideChange}
          verticalHeight={calendarHeight}
        >
          {children}
        </VirtualSwiper>
      </div>
    </SwipeableCalendarContext.Provider>
  )
}