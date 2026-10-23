import { countCalendarWeeks, layoutCalendarRows } from "@shared/components/swipeable-calendar/calendar-grid";
import { useSlideHeight } from "@shared/components/swipeable-calendar/SwipeableCalendar";
import { Month } from "@shared/period/month";
import { useMemo } from "react";


// 타일 내부 요소의 높이(px). CalendarTile의 스타일과 같은 값을 써야 칩 개수 계산이 맞는다.
export const TILE_LAYOUT = {
  // 그리드 바깥 위쪽 선
  gridBorderTop: 1,
  paddingY: 2,
  borderBottom: 1,
  dateRowHeight: 20,
  chipHeight: 15,
  chipGap: 2,
} as const;

// 날짜 + 칩 한 줄이 들어가는 높이. 이보다 작아지면 슬라이드 안에서 스크롤한다.
const MIN_TILE_HEIGHT = 44;


export type TileHeightInfo = {
  tileHeight: number;
  // 타일 하나에 보여줄 수 있는 칩 줄 수('+N' 줄 포함)
  limitedTaskPer: number;
  scroll: boolean;
}

const computeTileHeightInfo = (slideHeight: number, month: Month): TileHeightInfo => {
  const { rowHeight, scroll } = layoutCalendarRows({
    slideHeight,
    rows: countCalendarWeeks(month),
    minRowHeight: MIN_TILE_HEIGHT,
    reserved: TILE_LAYOUT.gridBorderTop,
  });
  const { paddingY, borderBottom, dateRowHeight, chipHeight, chipGap } = TILE_LAYOUT;
  const chipArea = rowHeight - borderBottom - paddingY * 2 - dateRowHeight;
  const limitedTaskPer = Math.max(1, Math.floor((chipArea + chipGap) / (chipHeight + chipGap)));
  return { tileHeight: rowHeight, limitedTaskPer, scroll };
}


/**
 * 월마다 주 수(4~6)가 다르므로, 슬라이드 높이를 그 달의 주 수로 나눠 타일 높이를 정한다.
 */
export const useTileHeightInfo = (month: Month): TileHeightInfo => {
  const slideHeight = useSlideHeight();
  return useMemo(() => computeTileHeightInfo(slideHeight, month), [month, slideHeight]);
}
