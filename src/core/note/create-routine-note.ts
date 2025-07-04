import { RoutineNote } from "@/entities/types/note";
import { Day } from "@/shared/period/day";
import dedent from "dedent";
import { RoutineTreeBuilder } from "../routine-tree/routine-tree-builder";



const initialContent = dedent`
\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n
---
%% Please do not modify the content below. It may damage your Routine Note data. %%
`;

export const createRoutineNote = async (day: Day): Promise<RoutineNote> => {
  const treeBuilder = await RoutineTreeBuilder.withRepositoriesAsync();
  const routineTree = treeBuilder.build(day);
  return {
    day,
    userContent: initialContent,
    tasks: [],
    routineTree
  };
}