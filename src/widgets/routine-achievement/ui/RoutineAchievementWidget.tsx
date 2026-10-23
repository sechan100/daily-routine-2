/** @jsxImportSource @emotion/react */
import { NoteEntity, noteRepository } from '@entities/note';
import { routineRepository } from '@entities/routine';
import { SwipeableCalendar } from '@shared/components/swipeable-calendar/SwipeableCalendar';
import { Month } from '@shared/period/month';
import { useToday } from '@shared/today/use-today';
import { useAsync } from '@shared/utils/use-async';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RoutineStreakContext } from '../model/routine-streak-context';
import { DayTasks, RoutineStreakCalculator, STREAK_WINDOW_DAYS } from '../model/streak';
import { useRoutineSelector } from '../model/use-routine-selector';
import { CalendarSlide } from './CalendarSlide';
import { RoutineSelector, ROUTINE_SELECTOR_HEIGHT } from './RoutineSelector';



export interface Props {
  month: Month;
  // 월 네비게이션을 제외하고 위젯이 쓸 수 있는 높이(px)
  height: number;
}
export const RoutineAchievementWidget = ({ 
  month: propsMonth,
  height,
}: Props) => {
  const [month, setMonth] = useState<Month>(propsMonth);
  const { currentRoutine, setCurrentRoutine } = useRoutineSelector();
  const today = useToday(s => s.today);
  const routinesAsync = useAsync(async () => await routineRepository.loadAll(), []);

  // 연속 기록 계산용 최근 1년 노트. 마운트마다(그리고 날짜가 바뀔 때만) 한 번 불러온다.
  const historyAsync = useAsync(async () => {
    return await noteRepository.loadBetween(today.clone(m => m.subtract(STREAK_WINDOW_DAYS - 1, "day")), today);
  }, [today]);

  const history = useMemo<DayTasks[] | null>(() => {
    if(historyAsync.error) return [];
    if(!historyAsync.value) return null;
    return historyAsync.value.map(note => ({ day: note.day, tasks: NoteEntity.flatten(note) }));
  }, [historyAsync.error, historyAsync.value]);

  // 선택지: 현재 루틴(정렬 순서) 다음에, 최근 1년 노트에만 남은 루틴(삭제·이름 변경 전)을 최근 것부터 붙인다.
  const knownRoutines = useMemo(() => {
    const current = [...(routinesAsync.value ?? [])]
    .sort((a, b) => a.properties.order - b.properties.order)
    .map(r => r.name);
    const recorded = [...(history ?? [])]
    .sort((a, b) => b.day.wholeDayDiff(a.day))
    .flatMap(({ tasks }) => tasks.filter(t => t.taskType === "routine").map(t => t.name));
    return Array.from(new Set([...current, ...recorded]));
  }, [history, routinesAsync.value]);

  // 선택한 루틴이 없거나 더 이상 없는 루틴이면 첫 루틴을 고른다. 사용자의 선택을 덮지 않도록 마운트 후 한 번만.
  const defaultedRef = useRef(false);
  const routinesLoaded = !!routinesAsync.value || !!routinesAsync.error;
  useEffect(() => {
    if(defaultedRef.current || !routinesLoaded || !history) return;
    defaultedRef.current = true;
    if(currentRoutine !== "" && knownRoutines.includes(currentRoutine)) return;
    setCurrentRoutine(knownRoutines[0] ?? "");
  }, [currentRoutine, history, knownRoutines, routinesLoaded, setCurrentRoutine]);

  const streak = useMemo(() => {
    if(!history) return null;
    const occurrences = RoutineStreakCalculator.collectOccurrences(history, currentRoutine);
    return RoutineStreakCalculator.computeStreak(occurrences, today);
  }, [currentRoutine, history, today]);
  
  return (
    <RoutineStreakContext.Provider value={streak}>
      <RoutineSelector month={month} knownRoutines={knownRoutines} />
      <SwipeableCalendar
        month={month}
        verticalHeight={Math.max(0, height - ROUTINE_SELECTOR_HEIGHT)}
        onMonthChange={setMonth}
      >
        {month => <CalendarSlide month={month} />}
      </SwipeableCalendar>
    </RoutineStreakContext.Provider>
  )
}
