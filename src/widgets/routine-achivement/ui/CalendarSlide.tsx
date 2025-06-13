/** @jsxImportSource @emotion/react */

import { noteRepository, routineTreeUtils } from "@/entities/note";
import { BaseCalendar } from "@/shared/components/calendar-legacy/BaseCalendar";
import { Day, DayFormat } from "@/shared/period/day";
import { Month } from "@/shared/period/month";
import { useAsync } from "@/shared/utils/use-async";
import { useCallback, useEffect, useMemo } from "react";
import { Tile } from "../model/types";
import { useRoutineSelector } from "../model/use-routine-selector";
import { CalendarTile } from "./CalendarTile";


interface Props {
  month: Month;
}
export const CalendarSlide = ({
  month,
}: Props) => {
  const notesAsync = useAsync(() => noteRepository.loadBetween(month.startDay, month.endDay), [month]);
  const { currentRoutine, addRoutineOptionsPerMonth, routineOptionsPerMonth } = useRoutineSelector();


  const tileMap = useMemo<Map<DayFormat, Tile> | null>(() => {
    if (notesAsync.loading || !notesAsync.value) return null;

    const notes = notesAsync.value;
    const map = new Map<DayFormat, Tile>();

    const end = month.startDay.daysInMonth();
    for (let d = 1; d <= end; d++) {
      const day = month.startDay.clone(m => m.add(d - 1, "day"));
      const note = notes.find(note => note.day.isSameDay(day));

      let tile: Tile | null = null;
      // 노트가 존재
      if (note) {
        const routine = routineTreeUtils.findRoutine(note.routineTree, currentRoutine);
        // 노트에 routine이 존재
        if (routine) {
          tile = {
            day,
            state: routine.state
          }
        }
      }
      if (!tile) {
        tile = {
          day,
          state: "inactive"
        }
      }
      map.set(day.format(), tile);
    }
    return map;
  }, [currentRoutine, month, notesAsync.loading, notesAsync.value]);


  // routineOptions를 최초 계산하여 routineOptionsPerMonth에 추가한다.
  useEffect(() => {
    if (notesAsync.loading || !notesAsync.value) return;
    if (routineOptionsPerMonth.has(month.format())) return;

    const notes = notesAsync.value;
    const existingRoutineNames = notes.flatMap(note => routineTreeUtils
      .getAllRoutines(note.routineTree)
      .map(routine => routine.name)
    );
    const routineOptions = Array.from(new Set(existingRoutineNames));
    addRoutineOptionsPerMonth(month.format(), routineOptions);
  }, [addRoutineOptionsPerMonth, month, notesAsync.loading, notesAsync.value, routineOptionsPerMonth]);


  const tile = useCallback((day: Day) => {
    if (day.month !== month.monthNum) return <></>;
    if (!tileMap) return <></>;

    const tile = tileMap.get(day.format());
    if (!tile) throw new Error(`tile not found for ${day.format()}`);
    return <CalendarTile tile={tile} />;
  }, [month.monthNum, tileMap]);


  const onTileClick = useCallback((day: Day) => {
    // console.log(day);
  }, []);


  const tileDisabled = useCallback((day: Day) => {
    return day.month !== month.monthNum;
  }, [month]);


  if (!tileMap) return <></>;

  return (
    <>
      <BaseCalendar
        month={month}
        setMonth={() => { }}
        onTileClick={onTileClick}
        tile={tile}
        showNavigation={false}
        tileDisabled={tileDisabled}
        styleOptions={{
          tileContainer: {
            gap: "0",
          },
          tile: {
            border: "0",
            overflow: "visible !important",
          }
        }}
      />
    </>
  );
};
