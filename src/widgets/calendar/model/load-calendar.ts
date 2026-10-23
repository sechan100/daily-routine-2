import { Month } from "@shared/period/month";
import { Calendar, Tile } from "./types";
import { RoutineEntity, routineRepository } from "@entities/routine";
import { NoteEntity, noteRepository, TaskEntity } from "@entities/note";
import { Day, DayFormat } from "@shared/period/day";
import { getCalendarGridRange } from "@shared/components/swipeable-calendar/calendar-grid";



export const loadCalendar = async (month: Month): Promise<Calendar> => {
  const routines = await routineRepository.loadAll();
  const showOnCalendarRoutines = routines.filter((r) => r.properties.showOnCalendar);
  const createTile = (day: Day): Tile => {
    const tileTasks = showOnCalendarRoutines
    .filter(r => RoutineEntity.isDueTo(r, day))
    .map(r => TaskEntity.createRoutineTask(r));

    return {
      day,
      tasks: tileTasks,
    };
  }

  // 이웃한 달까지 포함한 그리드의 첫 날·마지막 날. BaseCalendar의 주 시작 설정과 항상 일치한다.
  const { startDay, endDay } = getCalendarGridRange(month);

	const loadedNotes = await noteRepository.loadBetween(startDay, endDay);
	const tiles: Map<DayFormat, Tile> = new Map();
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