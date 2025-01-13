import { NoteEntity, noteRepository, RoutineNote } from "@entities/note";
import { Tile, TileMap } from "./types";
import { Month } from "@shared/period/month";
import { DayFormat } from "@shared/period/day";



/**
 * 
 * @param routineName
 * @param month
 */
export const resolveRoutineTiles = async (routineName: string, month: Month): Promise<TileMap> => {
  const notes = await noteRepository.loadBetween(month.startDay, month.endDay);
  const tileMap = new Map<DayFormat, Tile>();
  
  const end = month.startDay.daysInMonth();
  for(let d = 1; d <= end; d++) {
    const day = month.startDay.clone(m => m.add(d-1, "day"));
    const note = notes.find(note => note.day.isSameDay(day));

    let tile: Tile | null = null;
    // 노트가 존재
    if(note){
      const routineTask = NoteEntity.findTask(note, routineName);
      // 노트에 routine이 존재
      if(routineTask){
        tile = {
          day,
          state: routineTask.state
        }
      }
    }
    if(!tile){
      tile = {
        day,
        state: "inactive"
      }
    }
    tileMap.set(day.format(), tile);
  }
  return tileMap;
}