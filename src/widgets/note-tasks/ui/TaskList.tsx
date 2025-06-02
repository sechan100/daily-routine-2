/** @jsxImportSource @emotion/react */
import { DndContextProvider, OnDragEndArgs } from "@/shared/dnd/DndContextProvider";
import { useCallback } from "react";
import { useIndicatorStore } from "../model/indicator-store";
import { relocateTasks } from "../model/relocate-tasks";
import { useTasksStore } from "../model/tasks-store";
import { updateNewTasks } from "../model/update-new-tasks";
import { TaskItem } from "./TaskItem";


export const TaskList = () => {
  const day = useTasksStore(s => s.day);
  const tasks = useTasksStore(s => s.tasks);
  const { setTasks } = useTasksStore(s => s.actions);

  const handleDragEnd = useCallback(({ overId, activeId, dndCase }: OnDragEndArgs) => {
    const newTasks = relocateTasks(tasks, {
      overTaskName: String(overId),
      activeTaskName: String(activeId),
      dndCase,
    });
    setTasks(newTasks);
    updateNewTasks(day, newTasks);
  }, [day, setTasks, tasks]);

  return (
    <DndContextProvider
      indicatorStore={useIndicatorStore}
      onDragEnd={handleDragEnd}
      useCenterCollisionType={false}
    >
      <div css={{ overflowY: "auto" }}>
        {tasks.map(task => (
          <TaskItem
            key={task.name}
            task={task}
          />
        ))}
      </div>
    </DndContextProvider>
  )
}