import { RoutineNote, routineNoteQueryKeys } from "@/entities/note";
import { Day } from "@/shared/period/day";
import { useQuery } from "@tanstack/react-query";
import { ensureRoutineNote } from '../model/ensure-routine-note';


const getFallbackNote = (day: Day): RoutineNote => ({
  day,
  userContent: '',
  tasks: [],
  routineTree: {
    root: [],
  },
})

export const useRoutineNoteQuery = (day: Day) => {
  const query = useQuery({
    queryKey: routineNoteQueryKeys.note(day),
    queryFn: async () => await ensureRoutineNote(day),
  });

  return {
    note: query.data ?? getFallbackNote(day),
    query
  }
}