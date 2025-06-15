import { ensureRoutineNote } from '@/domain/note/ensure-routine-note';
import { RoutineNote } from "@/entities/types/note";
import { Day } from "@/shared/period/day";
import { useQuery } from "@tanstack/react-query";


const getFallbackNote = (day: Day): RoutineNote => ({
  day,
  userContent: '',
  tasks: [],
  routineTree: {
    root: [],
  },
})

export const routineNoteQueryKeys = {
  all: ['note'] as const,
  note: (day: Day) => ['note', day.format()] as const,
}

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