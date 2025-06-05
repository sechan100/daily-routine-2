import { Day } from "@/shared/period/day";
import { RoutineNoteStoreProvider } from "../hooks/use-routine-note";
import { NoteContent } from "./NoteContent";



type Props = {
  day: Day;
}
export const RoutineNotePage = ({ day }: Props) => {
  return (
    <RoutineNoteStoreProvider day={day}>
      <NoteContent />
    </RoutineNoteStoreProvider>
  )
}