import { NoteCompletion, RoutineNote, RoutineNoteDto } from "@entities/note";



export const getCompletion = (noteDto: RoutineNoteDto): NoteCompletion => {
  const note = RoutineNote.fromJSON(noteDto);
  return note.getCompletion();
}