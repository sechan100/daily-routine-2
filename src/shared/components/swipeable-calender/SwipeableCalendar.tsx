/** @jsxImportSource @emotion/react */
import { VirtualSwiper } from "@shared/components/VirtualSwiper";
import { Month } from "@shared/period/month";
import { useCallback, useEffect, useState } from "react";
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


interface Props {
  month: Month;
  children: (month: Month, index?: number) => React.ReactNode;
  verticalHeight?: number;
  maxWidth?: number
}
export const SwipeableCalendar = ({
  month: propsMonth,
  children,
  verticalHeight,
  maxWidth,
}: Props) => {
  const [months, setMonths] = useState<Month[]>(loadMonths(propsMonth));
  const [activeMonth, setActiveMonth] = useState<Month>(propsMonth);

  const resetMonths = useCallback((month: Month) => {
    console.log("resetMonths");
    setActiveMonth(month);
    setMonths(loadMonths(month));
  }, []);

  useEffect(() => {
    console.log(activeMonth.monthNum);
    console.log(months.map(m => m.monthNum));
  }, [activeMonth, months]);
  
  const onSlideChange = useCallback((month: Month) => {
    setActiveMonth(month);
  }, []);

  return (
    <div css={{
      position: 'relative',
      height: '100%',
      maxWidth,
    }}>
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