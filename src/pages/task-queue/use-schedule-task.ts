import { ensureRoutineNote } from "@/domain/note/ensure-routine-note";
import { noteRepository } from "@/entities/repository/note-repository";
import { Task } from "@/entities/types/task";
import { Day } from "@/shared/period/day";
import { routineNoteQueryKeys } from "@/stores/server/use-routine-note-query";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useTaskQueue } from "./use-task-queue";





export const useScheduleTask = (task: Task) => {
  const queryClient = useQueryClient();
  const { queue, updateQueue } = useTaskQueue();

  const scheduleTask = async (day: Day): Promise<void> => {
    // queue의 task에서 task를 제거하고 업데이트
    const newQueue = produce(queue, (draft) => {
      const index = draft.tasks.findIndex(t => t.name === task.name);
      if (index !== -1) {
        draft.tasks.splice(index, 1);
      }
    });
    await updateQueue(newQueue);

    // day에 해당하는 note에 task를 추가하고 note 업데이트
    const note = await ensureRoutineNote(day);
    const newNote = produce(note, (draft) => {
      draft.tasks = [...draft.tasks, task];
    });
    await noteRepository.save(newNote);
    queryClient.setQueryData(routineNoteQueryKeys.note(day), newNote);
  }

  return {
    scheduleTask
  }
}