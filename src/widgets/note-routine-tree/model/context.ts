import { Routine } from "@/entities/routine";
import { createContext, useContext } from "react";




export type RoutineTreeContextType = {
  openRoutineControl: (routine: Routine) => void;
}

export const RoutineTreeContext = createContext<RoutineTreeContextType | null>(null);

export const useRoutineTreeContext = () => {
  const context = useContext(RoutineTreeContext);
  if (!context) {
    throw new Error("useRoutineTreeContext must be used within a RoutineTreeProvider");
  }
  return context;
}