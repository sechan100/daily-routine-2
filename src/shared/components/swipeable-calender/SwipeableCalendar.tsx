/** @jsxImportSource @emotion/react */
import { VirtualSwiper } from "@shared/components/VirtualSwiper";
import { Month } from "@shared/period/month";
import { useCallback, useEffect, useState } from "react";
import { CalendarNavigation } from "./Nav";
import { useLeaf } from "@shared/view/use-leaf";



const loadMonths = (month: Month) => {
  return [
    month.subtract_cpy(1),
    month,
    month.add_cpy(1)
  ];
}

const loadEdgeMonth = (edge: "start" | "end", month: Month) => {
  if(edge === "start"){
    return month.subtract_cpy(1);
  } else {
    return month.add_cpy(1);
  }
};

const getKey = (month: Month) => month.startDay.format()


interface Props {
  month: Month;
  children: (month: Month, index?: number) => React.ReactNode;
  verticalHeight?: number;
  maxWidth?: number
  onMonthChange?: (month: Month) => void;
}
export const SwipeableCalendar = ({
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
      className="dr-swipeable-calendar"
      css={{
        position: 'relative',
        height: `calc(var(--input-height) + ${verticalHeight}px)`,
        overflow: 'hidden',
        maxWidth,
      }}
    >
      <CalendarNavigation
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