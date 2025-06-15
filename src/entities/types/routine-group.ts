/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoutineLike } from "./routine-like";


export type RoutineGroupProperties = {
  order: number;
}

export interface RoutineGroup extends RoutineLike {
  userContent: string;
  routineLikeType: "routine-group";
  properties: RoutineGroupProperties;
}

export const isRoutineGroup = (r: RoutineLike): r is RoutineGroup => {
  return r.routineLikeType === "routine-group";
}

export const UNGROUPED_GROUP_NAME = "UNGROUPED";