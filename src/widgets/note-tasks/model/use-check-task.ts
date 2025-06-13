import { CheckableState, Task } from "@/entities/note";
import { useNoteTasks } from '@/features/note';
import { confirmUncheckTask } from "@/shared/domain/confirm-uncheck-task";
import { useSettingsStores } from "@/shared/settings";
import { produce } from "immer";
import { useCallback } from "react";





type UseCheckTask = (task: Task) => {
  changeTaskState: (state: CheckableState) => void;
}
export const useCheckTask: UseCheckTask = (task) => {
  const { tasks, updateTasks } = useNoteTasks();

  const changeTaskState = useCallback(async (newState: CheckableState) => {
    if (
      newState === "unchecked" &&
      useSettingsStores.getState().confirmUncheckTask
    ) {
      if (!(await confirmUncheckTask())) {
        return;
      }
    }

    const newTasks = produce(tasks, (draft) => {
      const found = draft.find(t => t.name === task.name);
      if (!found) throw new Error("Check state change target routine not found");
      found.state = newState;
    })
    await updateTasks(newTasks);
  }, [task.name, updateTasks, tasks]);

  return {
    changeTaskState
  }
}
