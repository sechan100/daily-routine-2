import { CheckableState, NoteRoutineLike, RoutineTree } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { create } from "zustand";



export type RoutineTreeStore = {
  day: Day;
  root: NoteRoutineLike[];
  actions: {
    check: (name: string, state: CheckableState) => void;
    open: (routineGroupName: string, isOpen: boolean) => void;
    setRoutineTree: (routineTree: RoutineTree) => void;
  }
}
export const useRoutineTreeStore = create<RoutineTreeStore>()((set, get) => ({
  day: Day.today(),
  root: [],

  ///////////////// actions ////////////////////
  actions: {
    check: (name: string, state: CheckableState) => {
      const root = get().root.map((routine) => {
        if (routine.name === name) {
          return { ...routine, checkableState: state };
        }
        return routine;
      });
      set({ root });
    },
    open: (routineGroupName: string, isOpen: boolean) => {
      const root = get().root.map((like) => {
        if (like.name === routineGroupName) {
          return { ...like, isOpen };
        }
        return like;
      });
      set({ root });
    },
    setRoutineTree: (routineTree: RoutineTree) => {
      set({ day: routineTree.day, root: routineTree.root });
    }
  }
}));