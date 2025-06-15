import { Month } from "@/shared/period/month";
import { create } from "zustand";




type CalendarMonthStore = {
  month: Month;
  setMonth: (month: Month) => void;
}
export const useCalendarMonthStore = create<CalendarMonthStore>((set) => ({
  month: Month.now(),
  setMonth: (month: Month) => set(() => ({ month })),
}));