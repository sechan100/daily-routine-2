/** @jsxImportSource @emotion/react */
import { VirtualSwiper } from "@shared/components/VirtualSwiper";
import { Month } from "@shared/period/month";
import { createContext, useCallback, useContext, useState } from "react";
import { CalendarNavigation } from "./Nav";



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


// 슬라이드(한 달) 하나의 높이. VirtualSwiper가 슬라이드를 id로 memo하므로, 창 크기 변화는 props 대신 context로 전달한다.
const SlideHeightContext = createContext<number>(0);
export const useSlideHeight = () => useContext(SlideHeightContext);


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
      <SlideHeightContext.Provider value={verticalHeight ?? 0}>
        <VirtualSwiper
          datas={months}
          getKey={getKey}
          loadEdgeData={loadEdgeMonth}
          onSlideChange={onSlideChange}
          verticalHeight={verticalHeight}
        >
          {children}
        </VirtualSwiper>
      </SlideHeightContext.Provider>
    </div>
  )

}