import { Day } from "@/shared/period/day";
import { RoutineNoteStoreProvider } from "../model/use-routine-note";
import { Content } from "./Content";



type Props = {
  day: Day;
}
export const RoutineNotePage = ({ day }: Props) => {
  return (
    <RoutineNoteStoreProvider day={day}>
      <Content />
    </RoutineNoteStoreProvider>
  )
}