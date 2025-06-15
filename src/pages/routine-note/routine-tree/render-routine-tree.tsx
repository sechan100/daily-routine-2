import { NoteRoutineGroup, NoteRoutineLike, isNoteRoutine, isNoteRoutineGroup } from "@/entities/types/note-routine-like";
import { RoutineGroupItem } from "./RoutineGroupItem";
import { RoutineItem } from "./RoutineItem";



export const renderRoutineTree = (nrl: NoteRoutineLike, parent: NoteRoutineGroup | null, depth: number): React.ReactNode => {
  if (isNoteRoutineGroup(nrl)) {
    return <RoutineGroupItem key={nrl.name} group={nrl} depth={depth} />;
  }
  else if (isNoteRoutine(nrl)) {
    return <RoutineItem key={nrl.name} routine={nrl} parent={parent} depth={depth} />;
  }
  else {
    throw new Error(`Unknown NoteRoutineLike type: ${nrl}`);
  }
}
