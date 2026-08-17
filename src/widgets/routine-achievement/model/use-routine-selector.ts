import { MonthFormat } from "@shared/period/month";
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
    // 캐시된 options와 동일하면 불필요한 렌더링을 막기 위해 skip
    const prev = map.get(monthFormat);
    if(prev && prev.length === routineOptions.length && prev.every((v, i) => v === routineOptions[i])) return;
    map.set(monthFormat, routineOptions);
    set({ routineOptionsPerMonth: new Map(map) });
  }
}))