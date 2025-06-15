import { MonthFormat } from "@/shared/period/month";
import { create } from "zustand";


type UseRoutineSelector = {
  currentRoutine: string;
  setCurrentRoutine: (routine: string) => void;
  routineOptionsPerMonth: ReadonlyMap<MonthFormat, string[]>;
  addRoutineOptionsPerMonth: (monthFormat: MonthFormat, routineOptions: string[]) => void;
}

export const useRoutineSelector = create<UseRoutineSelector>((set, get) => ({
  currentRoutine: "",
  setCurrentRoutine: (routine: string) => set({ currentRoutine: routine }),
  routineOptionsPerMonth: new Map(),
  addRoutineOptionsPerMonth: (monthFormat: MonthFormat, routineOptions: string[]) => {
    const map = get().routineOptionsPerMonth as Map<MonthFormat, string[]>;
    if (!map.has(monthFormat)) {
      map.set(monthFormat, routineOptions);
      set({ routineOptionsPerMonth: new Map(map) });
    }
  }
}))