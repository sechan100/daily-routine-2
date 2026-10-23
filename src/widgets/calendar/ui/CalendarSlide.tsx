/** @jsxImportSource @emotion/react */
import { BaseCalendar, CalendarStyleOptions } from "@shared/components/BaseCalendar";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { useAsync } from "@shared/utils/use-async";
import { useCallback } from "react";
import { CalendarTile } from "./CalendarTile";
import { loadCalendar } from "../model/load-calendar";
import { useTabRoute } from "@shared/tab/use-tab-route";
import { useToday } from "@shared/today/use-today";
import { TILE_LAYOUT, useTileHeightInfo } from "./tile-height-info-context";


const BORDER = "1px solid var(--background-modifier-border)";

// 칸 사이 선이 겹쳐 두꺼워지지 않도록 끝쪽(오른쪽)·아래 선만 긋고, 바깥 위쪽 선은 컨테이너가 맡는다.
const STYLE_OPTIONS: CalendarStyleOptions = {
  tileContainer: {
    gap: "0",
    borderTop: `${TILE_LAYOUT.gridBorderTop}px solid var(--background-modifier-border)`,
  },
  tile: {
    border: 0,
    borderBottom: `${TILE_LAYOUT.borderBottom}px solid var(--background-modifier-border)`,
    borderInlineEnd: BORDER,
    "&:nth-of-type(7n)": {
      borderInlineEnd: 0,
    },
  },
};


interface CalendarSlideProps {
  month: Month;
}
export const CalendarSlide = ({ month }: CalendarSlideProps) => {
  const calendarAsync = useAsync(async () => await loadCalendar(month), [month]);
  const route = useTabRoute(s=>s.route);
  const layout = useTileHeightInfo(month);
  const today = useToday(s => s.today);

  // 다시 불러오는 동안에는 이전 값을 그대로 보여주고, 처음 불러올 때만 스켈레톤을 보여준다.
  const tiles = calendarAsync.value?.tiles ?? null;
  const loading = !tiles && !calendarAsync.error;

  const tile = useCallback((day: Day) => {
    const tile = tiles?.get(day.format()) ?? { day, tasks: [] };
    return <CalendarTile tile={tile} layout={layout} today={today} loading={loading} />;
  }, [layout, loading, tiles, today]);


  const tileDisabled = useCallback((day: Day) => {
    return day.month !== month.monthNum;
  }, [month]);

  const onTileClick = useCallback((day: Day) => {
    route("note", { day });
  }, [route]);


  return (
    <div
      // 최소 타일 높이로도 다 들어가지 않는 짧은 창에서는 슬라이드 안에서 스크롤한다. (스크롤이 월 이동으로 먹히지 않게 swiper 제스처를 끈다)
      className={layout.scroll ? "swiper-no-mousewheel swiper-no-swiping" : undefined}
      css={{
        height: "100%",
        overflowY: layout.scroll ? "auto" : "hidden",
      }}
    >
      <BaseCalendar
        month={month}
        setMonth={() => {}}
        onTileClick={onTileClick}
        tile={tile}
        showNavigation={false}
        tileDisabled={tileDisabled}
        rowHeight={layout.tileHeight}
        styleOptions={STYLE_OPTIONS}
      />
    </div>
  );
};
