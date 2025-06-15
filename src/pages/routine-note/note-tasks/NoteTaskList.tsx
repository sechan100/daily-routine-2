import { Task } from "@/entities/types/task";
import { useMemo } from "react";
import { NoteTasksContext, NoteTasksContextType } from "./context";
import { TaskListRoot } from "./TaskListRoot";




type NoteTaskListProps = {
  openTaskControls: (task: Task) => void;
}
export const NoteTaskList = ({
  openTaskControls
}: NoteTaskListProps) => {
  const context = useMemo<NoteTasksContextType>(() => ({
    openTaskControls
  }), [openTaskControls]);

  return (
    <NoteTasksContext.Provider value={context}>
      <TaskListRoot />
    </NoteTasksContext.Provider>
  )
}