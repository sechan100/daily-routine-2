import { Task } from "@/entities/task";
import { useMemo } from "react";
import { NoteTasksContext, NoteTasksContextType } from "../model/context";
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