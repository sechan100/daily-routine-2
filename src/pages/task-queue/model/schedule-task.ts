import { noteRepository } from "@/entities/note";
import { Task } from "@/entities/task";
import { ensureRoutineNote } from '@/features/note';
import { Day } from "@/shared/period/day";
import { produce } from "immer";





export const scheduleTask = async (tasks: Task[], day: Day, task: Task): Promise<Task[]> => {
  // queue의 task에서 task를 제거
  const newTasks = produce(tasks, (draft) => {
    const index = draft.findIndex(t => t.name === task.name);
    if (index !== -1) {
      draft.splice(index, 1);
    }
  });

  // day에 해당하는 note에 task를 추가
  const note = await ensureRoutineNote(day);
  const newNote = produce(note, (draft) => {
    draft.tasks = [...draft.tasks, task];
  });
  await noteRepository.save(newNote);

  return newTasks;
}