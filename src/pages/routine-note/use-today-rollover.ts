import { useRoutineNote } from "@features/note";
import { Day } from "@shared/period/day";
import { useToday } from "@shared/today/use-today";
import { useEffect, useRef } from "react";


/**
 * 자정을 넘기면, 이전의 오늘을 보고 있던 경우에만 새 오늘의 노트로 옮긴다. (없으면 만들어 저장된다)
 * 다른 날을 일부러 보고 있었다면 그대로 둔다.
 */
export const useTodayRollover = () => {
  const day = useRoutineNote(s => s.note.day);
  const setNote = useRoutineNote(s => s.setNote);
  const dayRef = useRef(day);
  dayRef.current = day;

  useEffect(() => useToday.subscribe((state, prev) => {
    if(state.today.isSameDay(prev.today)) return;
    if(dayRef.current.isSameDay(prev.today)) setNote(Day.today());
  }), [setNote]);
}
