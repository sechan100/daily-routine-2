import { NameOption } from "../option/NameOption";
import { ShowOnCalendarOption } from "../option/ShowOnCalendarOption";

export const TaskOption = {
  Name: NameOption,
  ShowOnCalendar: ShowOnCalendarOption
};
export { TaskDndContext } from "./ui/dnd-context";
export { BaseTaskFeature as AbstractTaskWidget } from "./ui/BaseTaskFeature";