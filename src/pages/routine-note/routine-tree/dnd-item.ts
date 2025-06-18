import { BaseDndItem } from "@/components/dnd/drag-item";
import { NoteRoutine, NoteRoutineGroup } from "@/entities/types/note-routine-like";


export type RoutineDndItem = BaseDndItem & {
  nrlType: "routine";
  routine: NoteRoutine;
} | BaseDndItem & {
  nrlType: "routine-group";
  routineGroup: NoteRoutineGroup;
}