import { RoutineNoteContent } from "./Content"
import { Day } from "@shared/period/day";
import { NoteContext } from "./NoteContext";



type Props = {
  day: Day;
}
export const RoutineNotePage = ({ day }: Props) => {
  return (
    <NoteContext day={day}>
      <RoutineNoteContent />
    </NoteContext>
  )
}