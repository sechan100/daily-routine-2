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
  const date = month.startDay.date;
  for(let i = 1; i <= month.endDay.date; i++){
    const loaded = loadedNotes.find(n => n.day.date === i);
    if(loaded){
      tiles.push({
        day: loaded.day,
        tasks: loaded.tasks.filter(t => t.showOnCalendar)
      })
    } else {
      const day = month.startDay.clone(m => m.add(i-1, "day"));
      tiles.push(createTile(day));
    }
  }

	return {
		month,
		tiles,
	}
}