import { Month } from "@shared/period/month";
import { Calendar, Tile } from "./types";
import { RoutineRepository } from "@entities/routine";
import { NoteRepository, NoteService } from "@entities/note";
import { Day } from "@shared/period/day";



export const loadCalendar = async (month: Month): Promise<Calendar> => {
  const routines = await RoutineRepository.loadAll();
  const showOnCalendarRoutines = routines.filter((r) => r.properties.showOnCalendar);
  const createTile = (day: Day) => {
    const noteCreator = NoteService.setLoaderForCreate(() => showOnCalendarRoutines);
    const note = noteCreator(day);
    return {
      day: note.day,
      tasks: note.tasks,
    } as Tile;
  }

	const loadedNotes = await NoteRepository.loadBetween(month.startDay, month.endDay);
	const tiles: Tile[] = [];
  const day = month.startDay.clone();
  while(day.isSameOrBefore(month.endDay)){
    const loaded = loadedNotes.find(n => n.day.isSameDay(day));
    if(loaded){
      tiles.push({
        day: loaded.day,
        tasks: loaded.tasks.filter(t => t.showOnCalendar)
      })
    } else {
      tiles.push(createTile(day))
    }
    day.moment.add(1, "day");
  }

	return {
		month: month.clone(),
		tiles,
	}
}