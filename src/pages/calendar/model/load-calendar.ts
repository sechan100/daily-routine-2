import { Checkable, noteRepository, Task } from "@/entities/note";
import { Routine, routineRepository } from "@/entities/routine";
import { isRoutineDueTo } from "@/features/note";
import { Day, DayFormat } from "@/shared/period/day";
import { Month } from "@/shared/period/month";
import { Calendar, Tile } from "./calendar";


/**
 * @param routines 
 * @param day
 * @param tasks 빈 배열도 가능하다(해당 날짜에 routineNote가 아직 없는 경우)
 * @returns 
 */
const createTileCurried = (routines: Routine[]) => (day: Day, tasks: Task[]): Tile => {
  const dayRoutines = routines
    .filter((r) => r.properties.showOnCalendar)
    .filter(r => isRoutineDueTo(r, day))
    .map(r => ({
      name: r.name,
      state: "unchecked",
    } as Checkable));


  const dayTasks = tasks.filter(t => t.properties.showOnCalendar);

  return {
    day,
    checkables: [...dayRoutines, ...dayTasks],
  };
}



export const loadCalendar = async (month: Month): Promise<Calendar> => {
  const routines = await routineRepository.loadAll();
  const createTile = createTileCurried(routines);

  // 추가로 로드해야하는 앞달의 tile들 개수
  const prevNeighboringMonthTilesNum = Day.getDaysOfWeek().indexOf(month.startDay.dow)
  const startDay = month.startDay.clone(m => m.subtract(prevNeighboringMonthTilesNum, "day"))

  // 뒷달
  const nextNeighboringMonthTilesNum = 6 - Day.getDaysOfWeek().indexOf(month.endDay.dow);
  const endDay = month.endDay.clone(m => m.add(nextNeighboringMonthTilesNum, "day"))

  const loadedNotes = await noteRepository.loadBetween(startDay, endDay);
  const tiles: Map<DayFormat, Tile> = new Map();
  let d = startDay;
  while (d.isSameOrBefore(endDay)) {
    const loadedNote = loadedNotes.find(n => n.day.isSameDay(d));
    if (loadedNote) {
      const loadedDay = loadedNote.day;
      tiles.set(loadedDay.format(), createTile(loadedDay, loadedNote.tasks));
    } else {
      tiles.set(d.format(), createTile(d, []));
    }
    d = d.clone(m => m.add(1, "day"));
  }


  return {
    month,
    tiles,
  }
}