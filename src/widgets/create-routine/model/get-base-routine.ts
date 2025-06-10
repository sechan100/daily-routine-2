import { Routine } from "@/entities/routine";
import { UNGROUPED_GROUP_NAME } from "@/entities/routine-group";
import { Day } from "@/shared/period/day";
import dedent from "dedent";

const initialContent = dedent`
\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n
---
%% Please do not modify the content below. It may damage your Routine data. %%
`;

export const getbaseRoutine = (): Routine => ({
  name: "",
  link: "",
  userContent: initialContent,
  routineLikeType: "routine",
  properties: {
    order: 0,
    group: UNGROUPED_GROUP_NAME,
    recurrenceUnit: "week",
    showOnCalendar: false,
    daysOfMonth: [],
    daysOfWeek: Day.getDaysOfWeek(),
    enabled: true,
  },
})