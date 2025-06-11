import { Task } from "@/entities/task";
import { useNoteTasks } from "@/features/note";
import { Button } from "@/shared/components/Button";
import { useModal } from "@/shared/components/modal";
import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { produce } from "immer";
import { Notice } from "obsidian";
import { useCallback } from "react";




type Props = {
  task: Task;
}
export const DeleteTaskButton = ({
  task,
}: Props) => {
  const modal = useModal();
  const { tasks, updateTasks } = useNoteTasks();

  const handleDelete = useCallback(async () => {
    const deletionConfirm = await doConfirm({
      title: "Delete task",
      confirmText: "Delete",
      description: `Are you sure you want to delete the task '${task.name}'?`,
      confirmBtnVariant: "destructive"
    })
    if (!deletionConfirm) return;
    const newTasks = produce(tasks, (draft) => {
      const index = draft.findIndex(t => t.name === task.name);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    });
    await updateTasks(newTasks);
    new Notice(`Task '${task.name}' has been deleted.`);
    modal.close();
  }, [modal, task.name, tasks, updateTasks]);


  return (
    <>
      <Button
        variant='destructive'
        onClick={handleDelete}
      >
        Delete Task
      </Button>
    </>
  )
}