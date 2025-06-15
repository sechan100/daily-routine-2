import { Task } from "@/entities/types/task";
import { TaskQueue } from "@/entities/types/task-queue";
import { Button } from "@/shared/components/Button";
import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { useModal } from "@/shared/components/modal/create-modal";
import { produce } from "immer";
import { Notice } from "obsidian";
import { useCallback } from "react";
import { useTaskQueue } from "./use-task-queue";


type Props = {
  task: Task;
}
export const DeleteQueueTaskButton = ({
  task,
}: Props) => {
  const modal = useModal();
  const { queue, updateQueue } = useTaskQueue();

  const handleDelete = useCallback(async () => {
    const deletionConfirm = await doConfirm({
      title: "Delete task",
      confirmText: "Delete",
      description: `Are you sure you want to delete the task '${task.name}'?`,
      confirmBtnVariant: "destructive"
    })
    if (!deletionConfirm) return;
    const newTasks = produce(queue.tasks, (draft) => {
      const index = draft.findIndex(t => t.name === task.name);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    });
    const newQueue: TaskQueue = {
      ...queue,
      tasks: newTasks,
    }
    await updateQueue(newQueue);
    new Notice(`Task '${task.name}' has been deleted.`);
    modal.close();
  }, [modal, queue, task.name, updateQueue]);


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