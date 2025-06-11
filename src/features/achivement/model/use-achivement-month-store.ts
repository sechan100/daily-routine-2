import { Month } from "@/shared/period/month";
import { create } from "zustand";




type AchivementMonthStore = {
  month: Month;
  setMonth: (month: Month) => void;
}
export const useAchivementMonthStore = create<AchivementMonthStore>((set) => ({
  month: Month.now(),
  setMonth: (month: Month) => set(() => ({ month })),
}));