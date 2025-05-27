/* eslint-disable @typescript-eslint/no-explicit-any */

import { Checkable } from "./checkable";


export type NoteRoutineLikeType = "routine" | "routine-group";

/**
 * NoteRoutine, NoteRoutineGroup의 추상화.
 */
export interface NoteRoutineLike {
  name: string;
  routineLikeType: NoteRoutineLikeType;
}

export interface NoteRoutine extends NoteRoutineLike, Checkable {
  routineLikeType: "routine";
}

export interface NoteRoutineGroup extends NoteRoutineLike {
  routineLikeType: "routine-group";
  routines: NoteRoutine[];
  isOpen: boolean;
}


export const noteRoutineLikeTypeGuards = {
  isRoutine: (obj: any): obj is NoteRoutine => {
    return obj && typeof obj === "object" && "routineLikeType" in obj && obj.routineLikeType === "routine";
  },

  isGroup: (obj: any): obj is NoteRoutineGroup => {
    return obj && typeof obj === "object" && "routineLikeType" in obj && obj.routineLikeType === "routine-group";
  }
}