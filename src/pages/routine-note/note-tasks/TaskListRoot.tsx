/** @jsxImportSource @emotion/react */
import { DndContext, OnDragEndContext } from "@/components/dnd/DndContext";
import { BaseDndItem } from "@/components/dnd/drag-item";
import { reorderTasks, taskCollisionResolver } from "@/core/task/resolve-dnd";
import { useNoteTasks } from "@/service/use-note-tasks";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { useCallback, useMemo } from "react";
import { NoteTaskItem } from "./NoteTaskItem";


export const TaskListRoot = () => {
  const hideCompletedTasksAndRoutines = useSettingsStores(s => s.hideCompletedTasksAndRoutines);
  const { tasks, updateTasks } = useNoteTasks();

  const filterdTasks = useMemo(() => {
    if (!hideCompletedTasksAndRoutines) {
      return tasks;
    } else {
      return tasks.filter(task => task.state === "unchecked");
    }
  }, [hideCompletedTasksAndRoutines, tasks]);

  const handleDragEnd = useCallback(async ({ active, over, dndCase }: OnDragEndContext<BaseDndItem>) => {
    const newTasks = reorderTasks(tasks, {
      active,
      over,
      dndCase,
    });
    await updateTasks(newTasks)
  }, [tasks, updateTasks]);

  return (
    <DndContext
      draggableTypes={["TASK"]}
      collisionResolver={taskCollisionResolver}
      onDragEnd={handleDragEnd}
    >
      {filterdTasks.map(task => (
        <NoteTaskItem
          key={task.name}
          task={task}
        />
      ))}
    </DndContext>
  )
}