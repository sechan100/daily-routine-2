import { CheckableState, RoutineTree, routineTreeUtils } from "@/entities/note";




export const checkRoutine = (tree: RoutineTree, routineName: string, state: CheckableState): RoutineTree => {
  const newTree = { ...tree };
  const routine = routineTreeUtils.findRoutine(newTree, routineName);
  if (!routine) throw new Error("Check state change target routine not found");
  routine.state = state;
  return newTree;
}