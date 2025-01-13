import { NoteEntity, RoutineNote, TaskState } from "@entities/note";
import { Day, DayFormat } from "@shared/period/day";
import { Month } from "@shared/period/month";


export type TileMap = Map<DayFormat, Tile>;
export type Tile = {
  day: Day;
  state: TaskState | "inactive";
}