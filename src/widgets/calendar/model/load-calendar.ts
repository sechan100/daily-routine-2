import { Month } from "@shared/period/month";
import { Calendar, Tile } from "./types";
import { RoutineEntity, RoutineRepository } from "@entities/routine";
import { NoteEntity, NoteRepository, TaskEntity } from "@entities/note";
import { Day } from "@shared/period/day";



export const loadCalendar = async (month: Month): Promise<Calendar> => {
  const routines = await RoutineRepository.loadAll();
  const showOnCalendarRoutines = routines.filter((r) => r.properties.showOnCalendar);
  const createTile = (day: Day): Tile => {
    const tileTasks = showOnCalendarRoutines
    .filter(r => RoutineEntity.isDueTo(r, day))
    .map(r => TaskEntity.createRoutineTask(r));

    return {
      day,
      tasks: tileTasks,
    } as Tile;
  }

  // 추가로 로드해야하는 앞달의 tile들 개수
  const prevNeighboringMonthTilesNum = Day.getDaysOfWeek().indexOf(month.startDay.dow)
  const startDay = month.startDay.clone(m => m.subtract(prevNeighboringMonthTilesNum, "day"))

  // 뒷달
  const nextNeighboringMonthTilesNum = 6 - Day.getDaysOfWeek().indexOf(month.endDay.dow);
  const endDay = month.endDay.clone(m => m.add(nextNeighboringMonthTilesNum, "day"))

	const loadedNotes = await NoteRepository.loadBetween(startDay, endDay);
	const tiles: Map<string, Tile> = new Map();
  let d = startDay;
  while(d.isSameOrBefore(endDay)){
    const loaded = loadedNotes.find(n => n.day.isSameDay(d));
    if(loaded){
      const loadedDay = loaded.day;
      tiles.set(loadedDay.format(), {
        day: loadedDay,
        tasks: NoteEntity.flatten(loaded).filter(t => t.showOnCalendar)
      })
    } else {
      tiles.set(d.format(), createTile(d));
    }
    d = d.clone(m => m.add(1, "day"));
  }


	return {
		month,
		tiles,
	}
}