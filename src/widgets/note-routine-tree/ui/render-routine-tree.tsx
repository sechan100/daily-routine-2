import { NoteRoutineLike, isNoteRoutine, isNoteRoutineGroup } from "@/entities/note";
import { RoutineGroupItem } from "./RoutineGroupItem";
import { RoutineItem } from "./RoutineItem";



export const renderRoutineTree = (nrl: NoteRoutineLike, depth: number): React.ReactNode => {
  if (isNoteRoutineGroup(nrl)) {
    return <RoutineGroupItem key={nrl.name} group={nrl} depth={depth} />;
  }
  else if (isNoteRoutine(nrl)) {
    return <RoutineItem key={nrl.name} routine={nrl} depth={depth} />;
  }
  else {
    throw new Error(`Unknown NoteRoutineLike type: ${nrl}`);
  }
};
