import { CheckableState, useRoutineTreeStore } from "@/entities/note";
import { useCallback } from "react";


export type RoutineTreeController = {
  check: (routinName: string, state: CheckableState) => void;
  openGroup: (groupName: string, open: boolean) => void;
}

export const useRoutineTreeController = (): RoutineTreeController => {

  const check = useCallback((name: string, state: CheckableState) => {
    const { tree } = useRoutineTreeStore.getState();
    const newTree = { ...tree };
    newTree.root = newTree.root.map((routine) => {
      if (routine.name === name) {
        return { ...routine, checkableState: state };
      }
      return routine;
    });
    useRoutineTreeStore.setState({ tree: newTree });
  }, []);

  const openGroup = useCallback((routineGroupName: string, isOpen: boolean) => {
    const { tree } = useRoutineTreeStore.getState();
    const newTree = { ...tree };
    newTree.root = newTree.root.map((like) => {
      if (like.name === routineGroupName) {
        return { ...like, isOpen };
      }
      return like;
    });
    useRoutineTreeStore.setState({ tree: newTree });
  }, []);

  return {
    check,
    openGroup
  }
}