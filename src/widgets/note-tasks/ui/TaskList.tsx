/** @jsxImportSource @emotion/react */
import { DndContextProvider, OnDragEndArgs } from "@/shared/dnd/DndContextProvider";
import { useCallback } from "react";
import { useIndicatorStore } from "../model/indicator-store";
import { relocateTasks } from "../model/relocate-tasks";
import { useTasksStore } from "../model/tasks-store";
import { TaskComponent } from "./TaskComponent";


export const TaskList = () => {
  const tasks = useTasksStore(s => s.tasks);
  const { setTasks } = useTasksStore(s => s.actions);

  const handleDragEnd = useCallback(({ overId, activeId, dndCase }: OnDragEndArgs) => {
    const newTasks = relocateTasks(tasks, {
      overTaskName: String(overId),
      activeTaskName: String(activeId),
      dndCase,
    });
    setTasks(newTasks);
  }, [setTasks, tasks]);

  return (
    <div
      css={{
        overflowY: "auto",
      }}
    >
      <DndContextProvider
        indicatorStore={useIndicatorStore}
        onDragEnd={handleDragEnd}
        useCenterCollisionType={false}
      >
        {tasks.map(task => (
          <TaskComponent
            key={task.name}
            task={task}
          />
        ))}
      </DndContextProvider>
    </div>
  )
}