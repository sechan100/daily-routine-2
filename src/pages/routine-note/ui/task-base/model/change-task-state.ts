import { noteRepository, NoteService, RoutineNote, TaskState } from "@/entities/note";


export const changeTaskState = async (note: RoutineNote, taskName: string, state: TaskState): Promise<RoutineNote> => {
  const task = NoteService.findTask(note, taskName);
  if (!task) throw new Error("Check state change target task not found");

  task.state = state;
  await noteRepository.saveOnUserConfirm(note);
  return NoteService.replaceTask(note, taskName, task);
}