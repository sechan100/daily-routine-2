import { NoteAchivementCalendar } from "@widgets/note-achivement"
import { Day } from "@shared/day";









export interface AchivementPageProps {
  day: Day;
}
export const AchivementPage = ({ day }: AchivementPageProps) => {

  return (
    <>
      <NoteAchivementCalendar day={day} />
    </>
  )
}