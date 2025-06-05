import { Task } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { TaskListRoot } from "./TaskListRoot";
import { TasksStoreProvider } from "./TasksStoreProvider";




type Props = {
  day: Day;
  tasks: Task[];
}
export const NoteTaskList = ({
  day,
  tasks,
}: Props) => {

  return (
    <TasksStoreProvider day={day} tasks={tasks}>
      <TaskListRoot />
    </TasksStoreProvider>
  )
}