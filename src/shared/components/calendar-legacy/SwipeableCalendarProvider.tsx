/** @jsxImportSource @emotion/react */
import { Month } from "@/shared/period/month";
import { useCallback, useState } from "react";
import { VirtualSwiper } from '../SwiperComponent';
import { SwipeableCalendarCalendarNavigation } from "./Nav";



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
  month: Month;
  children: (month: Month, index?: number) => React.ReactNode;
  /**
   * verticalHeight를 할당하면 자동으로 vertical swiper로 설정된다.
   * 설정한 값은 swiper의 높이로 사용된다.
   */
  verticalHeight?: number;
  maxWidth?: number
  onMonthChange?: (month: Month) => void;
}
export const SwipeableCalendarProvider = ({
  month: propsMonth,
  children,
  verticalHeight,
  maxWidth,
  onMonthChange
}: Props) => {
  const [months, setMonths] = useState<Month[]>(loadMonths(propsMonth));
  const [activeMonth, setActiveMonth] = useState<Month>(propsMonth);

  const onSlideChange = useCallback((month: Month) => {
    setActiveMonth(month);
    onMonthChange?.(month);
  }, [onMonthChange]);


  const resetMonths = useCallback((month: Month) => {
    setMonths(loadMonths(month));
    onSlideChange(month);
  }, [onSlideChange]);


  return (
    <div
      css={{
        position: 'relative',
        height: `calc(var(--input-height) + ${verticalHeight}px)`,
        overflow: 'hidden',
        maxWidth,
      }}
    >
      <SwipeableCalendarCalendarNavigation
        month={activeMonth}
        setMonth={resetMonths}
      />
      <VirtualSwiper
        datas={months}
        getKey={getKey}
        loadEdgeData={loadEdgeMonth}
        onSlideChange={onSlideChange}
        verticalHeight={verticalHeight}
      >
        {children}
      </VirtualSwiper>
    </div>
  )

}