import { confirmUncheckCheckable } from "@/domain/checkable/confirm-uncheck-checkable";
import { useNoteTasks } from "@/domain/note/use-note-tasks";
import { CheckableState } from "@/entities/types/checkable";
import { Task } from "@/entities/types/task";
import { useSettingsStores } from "@/stores/client/use-settings-store";
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
      if (!(await confirmUncheckCheckable())) {
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
