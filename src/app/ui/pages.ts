import { AchivementPage } from "@/pages/achivement/AchivementPage";
import { DrCalendar } from "@/pages/calendar/DrCalendar";
import { RoutineNotePage } from "@/pages/routine-note/RoutineNotePage";
import { RoutinesPage } from "@/pages/routines/RoutinesPage";
import { TaskQueuePage } from "@/pages/task-queue/TaskQueuePage";
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
    name: "queue",
    Page: TaskQueuePage
  },
  {
    name: "achievement",
    Page: AchivementPage
  },
  {
    name: "routines",
    Page: RoutinesPage
  }
]