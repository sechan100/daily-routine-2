import { css } from "@emotion/react";
import { useMemo } from "react";
import { useSwipeableCalendarContext } from "./swipeable-calendar-context";


type Border = {
  width: number; // px
  color: string;
  style: string;
}

export type CalendarStyleOptions = {
  tileBorder?: Border;
  hideNeighboringDays?: boolean; // neighboring days를 숨길지 여부
}
export const useBaseCalendarStyles = ({
  tileBorder,
  hideNeighboringDays = false,
}: CalendarStyleOptions) => {
  const { weekdaysHeight, weekdaysPaddingY, tileHeight } = useSwipeableCalendarContext();
  const calendarStyles = useMemo(() => css({
    // ========= Navigation ============
    '.react-calendar__navigation': {
      display: 'flex',
      'button:disabled': {
        backgroundColor: 'var(--color-base-10)',
      },
    },

    // ======== weekdays(월화수목금토일 표시되는 부분) ===========
    '.react-calendar__month-view__weekdays': {
      textAlign: 'center',
      height: weekdaysHeight,
      padding: `${weekdaysPaddingY}px 0`,

      // =========== 각 요일 글자 스타일 ==============
      div: {
        // 실제 글자
        abbr: {
          textDecoration: 'none',
        },
      },
    },

    // ======= tile container(month view일 때 날짜 타일 컨테이너) ==========
    '.react-calendar__month-view__days': {
      gap: '0',
      // border가 있으면 중앙 정렬이 깨지므로 translate로 보정
      transform: `translateX(${tileBorder ? `${(tileBorder.width * 7) / 2}px` : '0'})`,
      width: "100%",

      // =========== tile ======================
      '.react-calendar__tile': {
        padding: '0 !important',
        boxShadow: 'none !important',
        height: tileHeight,
        width: '100%',
        background: 'none',
        borderRadius: '0',
        border: (tileBorder ? `${tileBorder.width}px ${tileBorder.style} ${tileBorder.color}` : 'none'),
        margin: (tileBorder ? `0 -${tileBorder.width}px -${tileBorder.width}px 0 !important` : '0'),

        '&:hover': {
          backgroundColor: 'var(--color-base-20)',
        },

      },

      // 내부 원래 글씨
      abbr: {
        display: 'none',
      },
    },

    // ============ neighboring month tile ==============
    '.react-calendar__month-view__days__day--neighboringMonth': {
      visibility: hideNeighboringDays ? 'hidden' : 'visible',
      position: 'relative',
      '&::after': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: "inherit",
        opacity: 0.8,
        zIndex: 100,
      },
    }
  }), [hideNeighboringDays, tileBorder, tileHeight, weekdaysHeight, weekdaysPaddingY]);

  return calendarStyles;
}