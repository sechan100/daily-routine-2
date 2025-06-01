import { Task } from "@/entities/note";
import { useEffect } from "react";
import { useTasksStore } from "../model/tasks-store";



type TasksStoreProviderProps = {
  tasks: Task[];
  children?: React.ReactNode;
}
export const TasksStoreProvider = ({
  tasks,
  children,
}: TasksStoreProviderProps) => {

  useEffect(() => {
    useTasksStore.setState({ tasks });
  }, [tasks]);

  return (
    <>
      {children}
    </>
  )
}