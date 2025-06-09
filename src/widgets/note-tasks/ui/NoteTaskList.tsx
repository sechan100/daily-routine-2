import { Task, useTasksStore } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { useEffect } from "react";
import { TaskListRoot } from "./TaskListRoot";




type Props = {
  day: Day;
  tasks: Task[];
}
export const NoteTaskList = ({
  day,
  tasks,
}: Props) => {
  const setTasks = useTasksStore(s => s.setTasks);

  useEffect(() => {
    setTasks(tasks);
  }, [day, setTasks, tasks]);

  return (
    <TaskListRoot />
  )
}