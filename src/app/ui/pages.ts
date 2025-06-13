import { AchivementPage } from "@/pages/achivement";
import { DrCalendar } from "@/pages/calendar";
import { RoutineNotePage } from "@/pages/routine-note";
import { TaskQueuePage } from "@/pages/task-queue";
import { PageRouterRegistration, PageType } from "@/shared/route/page-type";



export const INITIAL_PAGE: PageType = "queue";

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
    name: "queue",
    Page: TaskQueuePage
  },
  {
    name: "achievement",
    Page: AchivementPage
  }
]