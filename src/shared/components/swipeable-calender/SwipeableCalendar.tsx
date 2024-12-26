/** @jsxImportSource @emotion/react */
import { VirtualSwiper } from "@shared/components/VirtualSwiper";
import { Month } from "@shared/period/month";
import { useCallback, useState } from "react";
import { CalendarNavigation } from "./Nav";
import { CalendarSlide } from "./CalendarSlide";
import { useLeaf } from "@shared/view/use-leaf";
import { Day, DayFormat } from "@shared/period/day";



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


interface Props<T> {
  month: Month;
  onTileClick: (day: Day) => void;
  tile: (day: Day) => JSX.Element;
  verticalHeight?: number;
}
export const SwipeableCalendar = <T,>({
  month: propsMonth,
  onTileClick,
  tile,
  verticalHeight
}: Props<T>) => {
  const [months, setMonths] = useState<Month[]>(loadMonths(propsMonth));
  const [activeMonth, setActiveMonth] = useState<Month>(propsMonth);

  const resetMonths = useCallback((month: Month) => {
    setActiveMonth(month);
    setMonths(loadMonths(month));
  }, []);
  
  const onSlideChange = useCallback((month: Month) => {
    setActiveMonth(month);
  }, []);

  return (
    <div css={{
      position: 'relative',
      height: '100%',
    }}>
      <CalendarNavigation
        month={activeMonth}
        onMonthChange={resetMonths}
      />
      <VirtualSwiper
        datas={months}
        getKey={getKey}
        loadEdgeData={loadEdgeMonth}
        onSlideChange={onSlideChange}
        verticalHeight={verticalHeight}
      >
        {(month) => (
          <CalendarSlide
            month={month}
            onTileClick={onTileClick}
            tile={tile}
          />
        )}
      </VirtualSwiper>
    </div>
  )

}