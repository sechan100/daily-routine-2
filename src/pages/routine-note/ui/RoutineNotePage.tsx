import { useNoteDayStore } from "@/entities/note";
import { ensureRoutineNote } from "@/features/note";
import useSWR from "swr";
import { NoteContent } from "./NoteContent";




export const RoutineNotePage = () => {
  const day = useNoteDayStore(state => state.day);
  const { data, error } = useSWR(
    ["routine-note", day.format(), day],
    async ([_, __, _day]) => await ensureRoutineNote(_day),
    {
      keepPreviousData: true
    }
  );

  if (error) {
    return <div>Error loading note</div>
  }
  if (!data) {
    return <div>Loading...</div>
  }
  return (
    <NoteContent note={data} />
  )
}