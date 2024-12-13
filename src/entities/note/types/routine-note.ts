import { Day } from "@shared/period/day";
import { TaskElementDto } from "./task";


export interface RoutineNoteDto {
  day: Day;
  root: TaskElementDto[];
}

export interface NoteCompletion {
  total: number;
  uncompleted: number;
  completed: number;
  percentage: number;
  percentageRounded: number;
}
