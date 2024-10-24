import { Day } from "shared/day";
import { create } from "zustand";




type PageType = "calendar" | "note" | "achivement";


interface UsePageRoute {
  page: PageType
  routePage: (page: PageType, day: Day) => void;
  routedDay: Day;
}
export const usePageRoute = create<UsePageRoute>((set) => ({
  page: "note",
  routePage: (page, day) => {
    set({ page, routedDay: day });
  },
  routedDay: Day.now(),
}));