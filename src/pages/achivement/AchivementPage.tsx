import { Month } from "@shared/period/month";
import { NoteAchivementCalendar } from "@widgets/note-achivement";


export interface AchivementPageProps {
  month: Month;
}
export const AchivementPage = ({ month }: AchivementPageProps) => {

  return (
    <>
      <NoteAchivementCalendar month={month} />
    </>
  )
}