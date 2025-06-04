import { NoteRoutine, NoteRoutineGroup } from "@/entities/note";
import { BaseDndItem } from "@/shared/dnd/drag-item";


export type RoutineDndItem = BaseDndItem & {
  nrlType: "routine";
  routine: NoteRoutine;
} | BaseDndItem & {
  nrlType: "routine-group";
  routineGroup: NoteRoutineGroup;
}