import { RoutineTaskDto, TaskDto, TaskGroupDto, TodoTaskDto } from "@entities/note";
import { RoutineTaskWidget } from '@widgets/routine';
import { TodoTaskWidget } from '@widgets/todo';

export const renderTask = (task: TaskDto, parent: TaskGroupDto | null) => {
  switch(task.taskType) {
    case "todo": return <TodoTaskWidget key={task.name} task={task as TodoTaskDto} parent={parent} />;
    case "routine": return <RoutineTaskWidget key={task.name} task={task as RoutineTaskDto} parent={parent} />;
    default: return null;
  }
}