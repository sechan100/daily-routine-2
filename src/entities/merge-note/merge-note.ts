import { RoutineNote } from "@/entities/note";
import { RoutineNoteCreator } from '@/entities/routine-to-note';
import { TaskCheckedStateNoteDep } from "./dependents/TaskCheckedStateNoteDep";
import { TodoTaskNoteDep } from "./dependents/TodoTaskNoteDep";


export const mergeNote = (note: RoutineNote, noteCreator: RoutineNoteCreator): RoutineNote => {
  const day = note.day;
  // note로부터 NoteDepentdent를 추출한다. 구체적인 추출 로직은 각 클래스의 생성자에서 담당한다.
  const dependents = [
    new TodoTaskNoteDep(note),
    new TaskCheckedStateNoteDep(note),
  ]
  const newNote = noteCreator.create(day);
  for (const dep of dependents) {
    dep.restoreData(newNote);
  }
  return newNote;
}