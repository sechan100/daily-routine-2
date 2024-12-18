import { VirtualSwiper } from "@shared/components/VirtualSwiper";
import { Month } from "@shared/period/month";
import { useCallback, useEffect, useState } from "react";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarSlide } from "./CalendarSlider";



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


interface CalendarWidgetProps {
  month: Month;
}
export const CalendarWidget = ({ month: propsMonth }: CalendarWidgetProps) => {
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
    <>
      <CalendarNavigation
        month={activeMonth}
        onMonthChange={resetMonths}
      />
      <VirtualSwiper
        datas={months}
        getKey={getKey}
        loadEdgeData={loadEdgeMonth}
        onSlideChange={onSlideChange}
      >
        {(month) => (
          <CalendarSlide month={month} />
        )}
      </VirtualSwiper>
    </>
  )

}