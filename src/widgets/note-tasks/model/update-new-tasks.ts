import { noteRepository, RoutineNote, Task } from "@/entities/note";
import { Day } from "@/shared/period/day";



export const updateNewTasks = async (day: Day, newTasks: Task[]) => {
  const note = await noteRepository.load(day);
  if (!note) {
    throw new Error(`Note for ${day.format()} does not exist.`);
  }
  const newNote: RoutineNote = {
    ...note,
    tasks: newTasks
  }
  await noteRepository.update(newNote);
}