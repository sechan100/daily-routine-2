/* eslint-disable @typescript-eslint/no-explicit-any */

export type RoutineLikeType = "routine" | "routine-group";

export interface RoutineLike {
  routineLikeType: RoutineLikeType;
  name: string;
  properties: {
    order: number;
  };
}

export const isRoutineLike = (r: any): r is RoutineLike => {
  const hasName = typeof r.name === "string";
  const hasRoutineLikeType = r.routineLikeType === "routine" || r.routineLikeType === "routine-group";
  return hasName && hasRoutineLikeType;
}
