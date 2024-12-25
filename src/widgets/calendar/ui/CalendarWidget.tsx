/** @jsxImportSource @emotion/react */
import { VirtualSwiper } from "@shared/components/VirtualSwiper";
import { Month } from "@shared/period/month";
import { useCallback, useState } from "react";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarSlide } from "./CalendarSlider";
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


interface CalendarWidgetProps {
  month: Month;
}
export const CalendarWidget = ({ month: propsMonth }: CalendarWidgetProps) => {
  const [months, setMonths] = useState<Month[]>(loadMonths(propsMonth));
  const [activeMonth, setActiveMonth] = useState<Month>(propsMonth);
  const leafBgColor = useLeaf(s=>s.leafBgColor);

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
      <div css={{
        position: 'fixed',
        top: 500,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        backgroundColor: leafBgColor,
      }} />
      <CalendarNavigation
        month={activeMonth}
        onMonthChange={resetMonths}
      />
      <VirtualSwiper
        datas={months}
        getKey={getKey}
        loadEdgeData={loadEdgeMonth}
        onSlideChange={onSlideChange}
        verticalHeight={500}
      >
        {(month) => (
          <CalendarSlide month={month} />
        )}
      </VirtualSwiper>
    </div>
  )

}