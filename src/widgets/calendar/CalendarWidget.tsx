import { Task } from "@entities/note";
import { BaseCalendar } from "@shared/components/BaseCalendar";
import { VirtualSwiper } from "@shared/components/VirtualSwiper";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useAsync } from "@shared/use-async";
import { useCallback, useEffect, useState } from "react";
import { CalendarNavigation } from "./CalendarNavigation";
import { CalendarTile } from "./CalendarTile";
import { loadCalendar } from "./model/load-calendar";



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



interface CalendarSlideProps {
  month: Month;
}
const CalendarSlide = ({ month }: CalendarSlideProps) => {
  const tiles = useAsync(async () => {
    const c = await loadCalendar(month);
    return c.tiles;
  }, [month]);

  const tile = useCallback((day: Day) => {
    let tile = {
      day,
      tasks: [] as Task[]
    }
    if(tiles.value && day.month === month.monthNum){
      tile = tiles.value[day.date-1] || tile ;
    }
    return <CalendarTile tile={tile} />
  }, [month, tiles.value]);

  if(tiles.loading) return <div>Loading...</div>
  return (
    <BaseCalendar
      month={month}
      setMonth={() => {}}
      tile={tile}
      showNavigation={false}
    />
  )
}