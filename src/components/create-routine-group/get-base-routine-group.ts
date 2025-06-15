import { RoutineGroup } from "@/entities/types/routine-group";
import dedent from "dedent";

const initialContent = dedent`
\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n
---
%% Please do not modify the content below. It may damage your Group data. %%
`;

export const getBaseRoutineGroup = (): RoutineGroup => ({
  name: "",
  userContent: initialContent,
  routineLikeType: "routine-group",
  properties: {
    order: 0,
  },
})