import { noteService, RoutineNote, Task } from "@/entities/note";
import { Day } from "@/shared/period/day";



export const updateNewTasks = async (day: Day, newTasks: Task[]) => {
  const note = await noteService.load(day);
  if (!note) {
    throw new Error(`Note for ${day.format()} does not exist.`);
  }
  const newNote: RoutineNote = {
    ...note,
    tasks: newTasks
  }
  await noteService.update(newNote);
}