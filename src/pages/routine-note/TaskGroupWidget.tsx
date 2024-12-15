import { TaskGroup } from "@entities/note";
import { BaseGroupHeadFeature } from "@features/task-el/ui/TaskGroupHeadFeature"
import { renderTask } from "./render-task-widget";



interface Props {
  group: TaskGroup;
}
export const TaskGroupWidget = ({
  group
}: Props) => {
  
  return (
    <BaseGroupHeadFeature group={group}>
      {group.children.map(task => renderTask(task, group))}
    </BaseGroupHeadFeature>
  )
}