import { TaskGroup } from "@entities/note"
import { BaseTaskGroupFeature } from "@features/task-el/ui/BaseTaskGroupFeature"





interface Props {
  group: TaskGroup;
}
export const TaskGroupWidget = ({
  group
}: Props) => {
  
  return (
    <BaseTaskGroupFeature
      group={group}
    />
  )
}