import { AchivementPage } from "@/pages/achivement";
import { DrCalendar } from "@/pages/calendar";
import { RoutineNotePage } from "@/pages/routine-note";
import { PageRouterRegistration, PageType } from "@/shared/route/page-type";



export const INITIAL_PAGE: PageType = "note";
export const PAGES: PageRouterRegistration[] = [
  {
    name: "note",
    Page: RoutineNotePage,
  },
  {
    name: "calendar",
    Page: DrCalendar
  },
  {
    name: "achievement",
    Page: AchivementPage
  }
]