import { RoutineTree } from '@/entities/note';
import { useEffect } from "react";
import { useRoutineTreeStore } from "../hooks/routine-tree-store";



type RoutineTreeStoreProviderProps = {
  routineTree: RoutineTree;
  children?: React.ReactNode;
}
export const RoutineTreeStoreProvider = ({
  routineTree,
  children,
}: RoutineTreeStoreProviderProps) => {

  useEffect(() => {
    useRoutineTreeStore.getState().actions.setRoutineTree(routineTree);
  }, [routineTree]);

  return (
    <>
      {children}
    </>
  )
}