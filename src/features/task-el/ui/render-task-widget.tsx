import { RoutineTask, Task, TaskGroup, TodoTask } from "@entities/note";
import { RoutineTaskWidget } from '@widgets/routine';
import { TodoTaskWidget } from '@widgets/todo';

export const renderTask = (task: Task, parent: TaskGroup | null) => {
  switch(task.taskType) {
    case "todo": return <TodoTaskWidget key={task.name} task={task as TodoTask} parent={parent} />;
    case "routine": return <RoutineTaskWidget key={task.name} task={task as RoutineTask} parent={parent} />;
    default: return null;
  }
}