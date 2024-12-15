import { NoteEntity, NoteRepository, RoutineNote } from "@entities/note";


export const checkTask = async (note: RoutineNote, taskName: string, check: boolean): Promise<RoutineNote> => {
  const task = NoteEntity.findTask(note, taskName);
  if(!task) throw new Error("Check state change target task not found");
  
  task.checked = check;
  await NoteRepository.saveOnUserConfirm(note);
  return { ...note };
}