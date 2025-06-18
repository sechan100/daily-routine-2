import { NoteRoutineGroup, NoteRoutineLike, isNoteRoutine, isNoteRoutineGroup } from "@/entities/types/note-routine-like";
import { RoutineGroupNode } from "./RoutineGroupNode";
import { RoutineNode } from "./RoutineNode";



export const renderRoutineTree = (nrl: NoteRoutineLike, parent: NoteRoutineGroup | null, depth: number): React.ReactNode => {
  if (isNoteRoutineGroup(nrl)) {
    return <RoutineGroupNode key={nrl.name} group={nrl} depth={depth} />;
  }
  else if (isNoteRoutine(nrl)) {
    return <RoutineNode key={nrl.name} routine={nrl} parent={parent} depth={depth} />;
  }
  else {
    throw new Error(`Unknown NoteRoutineLike type: ${nrl}`);
  }
}
