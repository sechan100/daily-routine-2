import { Task } from "@/entities/note";
import { TaskList } from "./TaskList";
import { TasksStoreProvider } from "./TasksStoreProvider";




type Props = {
  tasks: Task[];
}
export const NoteTasksWidget = ({
  tasks,
}: Props) => {

  return (
    <TasksStoreProvider tasks={tasks}>
      <TaskList />
    </TasksStoreProvider>
  )
}