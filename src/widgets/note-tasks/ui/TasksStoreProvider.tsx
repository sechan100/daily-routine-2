import { Task } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { useEffect } from "react";
import { useTasksStore } from "../model/tasks-store";



type TasksStoreProviderProps = {
  tasks: Task[];
  day: Day;
  children?: React.ReactNode;
}
export const TasksStoreProvider = ({
  tasks,
  day,
  children,
}: TasksStoreProviderProps) => {

  useEffect(() => {
    useTasksStore.setState({ tasks, day });
  }, [day, tasks]);

  return (
    <>
      {children}
    </>
  )
}