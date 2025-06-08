import { create } from "zustand";
import { RoutineTree } from "../types/routine-tree";



export type RoutineTreeStore = {
  tree: RoutineTree;
  setTree: (tree: RoutineTree) => void;
}
export const useRoutineTreeStore = create<RoutineTreeStore>()((set, get) => ({
  tree: {
    root: []
  },
  setTree: (tree: RoutineTree) => set({ tree }),
}));