import { Day } from "@/shared/period/day";
import { NoteRoutineLike } from "./note-routine-like";


export type RoutineTree = {
  day: Day;
  root: NoteRoutineLike[];
}