import { Day } from "shared/day";
import { create } from "zustand";




type PageType = "calendar" | "note" | "achivement";

type SetPageCmd = {
  page: "calendar";
  data?: {
    day: Day // 캘린더의 기준이 될 날짜를 선택
  }
} | {
  page: "note";
  data?: {
    day: Day // 루틴노트의 기준이 될 날짜를 선택
  }
} | {
  page: "achivement";
  data?: {
    day: Day // 루틴노트의 기준이 될 날짜를 선택
  }
}


interface UsePageRoute {
  page: PageType
  setPage: (cmd: SetPageCmd) => void;
  setPageCmd: SetPageCmd | null; // 해당되는 page에서 cmd를 받아서 적용하고 비워주어야 한다.
}
export const usePageRoute = create<UsePageRoute>((set) => ({
  page: "note",
  setPage: (cmd) => {
    set({
      page: cmd.page,
      setPageCmd: cmd
    });
  },
  setPageCmd: null
}));