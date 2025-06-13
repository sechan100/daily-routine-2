import { Day } from "@/shared/period/day"



export const routineNoteQueryKeys = {
  all: ['note'] as const,
  note: (day: Day) => ['note', day.format()] as const,
}