import { RoutineNote } from '@/entities/note';
import { Day } from "@/shared/period/day";
import dedent from "dedent";
import { RoutineTreeBuilder } from './routine-tree-builder';



const initialContent = dedent`
\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n
---
%% Please do not modify the content below. It may damage your Routine Note data. %%
`;

export const createRoutineNote = async (day: Day): Promise<RoutineNote> => {
  const treeBuilder = await RoutineTreeBuilder.withRepositoriesAsync();
  const routienTree = treeBuilder.build(day);
  return {
    day,
    userContent: initialContent,
    tasks: [],
    routineTree,
  };
}