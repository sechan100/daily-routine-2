import { CheckableState, Task } from "@/entities/note";
import { useNoteTasks } from '@/features/note';
import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { getSettings } from "@/shared/settings";
import { produce } from "immer";
import { useCallback } from "react";





type UseCheckTask = (task: Task) => {
  handleTaskCheck: () => Promise<void>;
}
export const useCheckTask: UseCheckTask = (task) => {
  const { tasks, updateTasks } = useNoteTasks();

  const handleTaskCheck = useCallback(async () => {

    const updateCheckableState = (state: CheckableState) => produce(tasks, (draft) => {
      const found = draft.find(t => t.name === task.name);
      if (!found) throw new Error("Check state change target routine not found");
      found.state = state;
      return draft;
    });

    let newTasks: Task[];
    // dispatch check state change
    // un-check
    if (task.state === "unchecked") {
      newTasks = updateCheckableState("accomplished");
    }
    // accomplished & failed
    else if (task.state === "accomplished" || task.state === "failed") {
      let doUncheck = true;
      if (getSettings().confirmUncheckTask) {
        doUncheck = await doConfirm({
          title: "Uncheck Task",
          description: "Are you sure you want to uncheck this task?",
          confirmText: "Uncheck",
          confirmBtnVariant: "accent",
        })
      }
      if (!doUncheck) {
        return;
      }
      newTasks = updateCheckableState("unchecked");
    }
    else {
      throw new Error(`Unknown routine state: ${task.state}`);
    }
    // update
    await updateTasks(newTasks);
  }, [task.state, task.name, updateTasks, tasks]);

  return {
    handleTaskCheck
  }
}
