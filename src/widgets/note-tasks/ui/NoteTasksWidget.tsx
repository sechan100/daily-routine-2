import { Task } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { TaskList } from "./TaskList";
import { TasksStoreProvider } from "./TasksStoreProvider";




type Props = {
  day: Day;
  tasks: Task[];
}
export const NoteTasksWidget = ({
  day,
  tasks,
}: Props) => {

  return (
    <TasksStoreProvider day={day} tasks={tasks}>
      <TaskList />
    </TasksStoreProvider>
  )
}