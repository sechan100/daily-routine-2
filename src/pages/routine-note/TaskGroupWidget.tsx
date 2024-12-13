import { TaskGroupDto } from "@entities/note";
import { BaseGroupHeadFeature } from "@features/task-el/ui/TaskGroupHeadFeature"
import { renderTask } from "./render-task-widget";



interface Props {
  group: TaskGroupDto;
}
export const TaskGroupWidget = ({
  group
}: Props) => {
  
  return (
    <BaseGroupHeadFeature group={group}>
      {group.tasks.map(task => renderTask(task, group))}
    </BaseGroupHeadFeature>
  )
}