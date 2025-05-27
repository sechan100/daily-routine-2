/* eslint-disable @typescript-eslint/no-explicit-any */

import { RoutineLikeType } from "../../routine-like/model/routine-like";
import { Checkable } from "./checkable";


/**
 * NoteRoutine, NoteRoutineGroup의 추상화.
 */
export interface NoteRoutineLike {
  name: string;
  routineLikeType: RoutineLikeType;
}

export interface NoteRoutine extends NoteRoutineLike, Checkable {
  routineLikeType: "routine";
}

export interface NoteRoutineGroup extends NoteRoutineLike {
  routineLikeType: "routine-group";
  routines: NoteRoutine[];
  isOpen: boolean;
}

export const isNoteRoutine = (obj: any): obj is NoteRoutine => {
  return obj && typeof obj === "object" && "routineLikeType" in obj && obj.routineLikeType === "routine";
}

export const isNoteRoutineGroup = (obj: any): obj is NoteRoutineGroup => {
  return obj && typeof obj === "object" && "routineLikeType" in obj && obj.routineLikeType === "routine-group";
}