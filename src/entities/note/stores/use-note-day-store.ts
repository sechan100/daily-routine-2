import { Day } from "@/shared/period/day";
import { create } from "zustand";



export type NoteDayStore = {
  day: Day;
  setDay: (day: Day) => void;
}
export const useNoteDayStore = create<NoteDayStore>()((set, get) => ({
  day: Day.today(),
  setDay: (day: Day) => {
    set({ day });
  },
}));