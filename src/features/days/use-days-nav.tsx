import { Day } from "shared/day";
import { create } from "zustand";







export interface UseDaysNav {
  percentageUpdateCmd: {day: Day, percentage: number} | null;
  updatePercentage: (cmd: {day: Day, percentage: number}) => void;
}

export const useDaysNav = create<UseDaysNav>((set) => ({
  percentageUpdateCmd: null,
  updatePercentage: (cmd) => set({percentageUpdateCmd: cmd})
}));