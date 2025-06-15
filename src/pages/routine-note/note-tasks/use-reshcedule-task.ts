import { ensureRoutineNote } from "@/domain/note/ensure-routine-note";
import { useNoteTasks } from "@/domain/note/use-note-tasks";
import { noteRepository } from "@/entities/repository/note-repository";
import { taskQueueRepository } from "@/entities/repository/task-queue-repository";
import { Task } from "@/entities/types/task";
import { TaskQueue } from "@/entities/types/task-queue";
import { Day } from "@/shared/period/day";
import { routineNoteQueryKeys } from "@/stores/server/use-routine-note-query";
import { taskQueueQueryKey, useTaskQueueQuery } from "@/stores/server/use-task-queue-query";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useCallback } from "react";


export const useRescheduleTask = (task: Task) => {
  const queryClient = useQueryClient();
  const { queue } = useTaskQueueQuery();
  const { tasks, updateTasks } = useNoteTasks();


  const deferTask = useCallback(async (): Promise<void> => {
    // 기존 tasks에서 task를 제거하고 업데이트
    const newTasks = produce(tasks, (draft) => {
      const index = draft.findIndex(t => t.name === task.name);
      if (index === -1) {
        throw new Error(`Task "${task.name}" not found in tasks.`);
      }
      draft.splice(index, 1);
    });
    await updateTasks(newTasks);

    // task queue에 task를 추가
    const newQueue = produce(queue, (draft) => {
      draft.tasks = [task, ...draft.tasks];
    });
    queryClient.setQueryData<TaskQueue>(taskQueueQueryKey, newQueue);
    await taskQueueRepository.update(newQueue);
  }, [queryClient, queue, task, tasks, updateTasks]);

  const rescheduleTask = useCallback(async (day: Day): Promise<void> => {
    // 기존 tasks에서 task를 제거하고 업데이트
    const newTasks = produce(tasks, (draft) => {
      const index = draft.findIndex(t => t.name === task.name);
      if (index === -1) {
        throw new Error(`Task "${task.name}" not found in tasks.`);
      }
      draft.splice(index, 1);
    });
    await updateTasks(newTasks);

    // 해당 day의 note에 task를 추가
    const dayNote = await ensureRoutineNote(day);
    const newNote = produce(dayNote, (draft) => {
      draft.tasks = [task, ...draft.tasks];
    });
    queryClient.setQueryData(routineNoteQueryKeys.note(day), newNote);
    await noteRepository.save(newNote);
  }, [queryClient, task, tasks, updateTasks]);


  return {
    deferTask,
    rescheduleTask,
  }
}