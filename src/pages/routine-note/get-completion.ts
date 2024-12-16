import { NoteCompletion, RoutineNote, RoutineNote } from "@entities/note";



export const getCompletion = (noteDto: RoutineNote): NoteCompletion => {
  const note = RoutineNote.fromJSON(noteDto);
  return note.getCompletion();
}