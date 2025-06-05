import { CheckableState, RoutineTree } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { create } from "zustand";



export type RoutineTreeStore = {
  tree: RoutineTree;
  actions: {
    check: (name: string, state: CheckableState) => void;
    open: (routineGroupName: string, isOpen: boolean) => void;
    setRoutineTree: (routineTree: RoutineTree) => void;
  }
}
export const useRoutineTreeStore = create<RoutineTreeStore>()((set, get) => ({
  tree: {
    day: Day.today(),
    root: []
  },

  ///////////////// actions ////////////////////
  actions: {
    check: (name: string, state: CheckableState) => {
      const newTree = { ...get().tree };
      newTree.root = newTree.root.map((routine) => {
        if (routine.name === name) {
          return { ...routine, checkableState: state };
        }
        return routine;
      });
      set({ tree: newTree });
    },
    open: (routineGroupName: string, isOpen: boolean) => {
      const newTree = { ...get().tree };
      newTree.root = newTree.root.map((like) => {
        if (like.name === routineGroupName) {
          return { ...like, isOpen };
        }
        return like;
      });
      set({ tree: newTree });
    },
    setRoutineTree: (routineTree: RoutineTree) => {
      set({ tree: routineTree });
    }
  }
}));