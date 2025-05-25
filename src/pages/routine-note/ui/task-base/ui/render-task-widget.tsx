import { RoutineTask, Task, TaskGroup, TodoTask } from "@/entities/note";
import { RoutineTaskElment } from "../../routine/RoutineTaskElment";
import { TodoTaskWidget } from "../../todo/TodoTaskWidget";

export const renderTask = (task: Task, parent: TaskGroup | null) => {
  switch (task.taskType) {
    case "todo": return <TodoTaskWidget key={task.name} task={task as TodoTask} parent={parent} />;
    case "routine": return <RoutineTaskElment key={task.name} task={task as RoutineTask} parent={parent} />;
    default: return null;
  }
}