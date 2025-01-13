import { NoteEntity, noteRepository, RoutineNote, TaskState } from "@entities/note";


export const changeTaskState = async (note: RoutineNote, taskName: string, state: TaskState): Promise<RoutineNote> => {
  const task = NoteEntity.findTask(note, taskName);
  if(!task) throw new Error("Check state change target task not found");
  
  task.state = state;
  await noteRepository.saveOnUserConfirm(note);
  return NoteEntity.replaceTask(note, taskName, task);
}