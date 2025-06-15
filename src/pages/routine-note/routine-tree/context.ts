import { Routine } from "@/entities/types/routine";
import { RoutineGroup } from "@/entities/types/routine-group";
import { createContext, useContext } from "react";




export type RoutineTreeContextType = {
  openRoutineControls: (routine: Routine) => void;
  openRoutineGroupControls: (group: RoutineGroup) => void;
}

export const RoutineTreeContext = createContext<RoutineTreeContextType | null>(null);

export const useRoutineTreeContext = () => {
  const context = useContext(RoutineTreeContext);
  if (!context) {
    throw new Error("useRoutineTreeContext must be used within a RoutineTreeProvider");
  }
  return context;
}