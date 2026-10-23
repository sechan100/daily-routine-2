import type { Task, TaskState } from "@entities/note";
import type { Day } from "@shared/period/day";
import type { Month } from "@shared/period/month";


/**
 * 노트 하나에서 꺼낸 날짜와 task 목록(그룹은 펼친 상태).
 * 노트 구조(그룹 중첩 등)를 몰라도 되도록 호출자가 NoteEntity.flatten 결과를 넘긴다.
 */
export type DayTasks = {
  day: Day;
  tasks: Task[];
}

/**
 * 루틴의 한 회차. 노트에 해당 루틴 task가 있는 날을 '그날 예정된 회차'로 본다.
 * 노트가 없는 날은 기록 자체가 없으므로 회차로 세지 않는다. (연속 기록을 끊지도, 늘리지도 않는다)
 * 루틴의 현재 반복 설정(isDueTo)은 과거의 설정과 다를 수 있어 근거로 쓰지 않는다.
 */
export type RoutineOccurrence = {
  day: Day;
  state: TaskState;
}

export type RoutineStreak = {
  current: number;
  longest: number;
}

export type RoutineMonthSummary = {
  done: number;
  scheduled: number;
}


// 연속 기록 계산에 쓰는 기간(오늘 포함 365일). 이보다 긴 기록은 longest에 반영되지 않는다.
export const STREAK_WINDOW_DAYS = 365;


const collectOccurrences = (days: DayTasks[], routineName: string): RoutineOccurrence[] => {
  return days
  .flatMap(({ day, tasks }) => {
    const task = tasks.find(t => t.taskType === "routine" && t.name === routineName);
    return task ? [{ day, state: task.state }] : [];
  })
  .sort((a, b) => a.day.wholeDayDiff(b.day));
}

// 미래의 회차는 아직 결과가 정해지지 않았으므로 어떤 통계에도 넣지 않는다.
const isFuture = (day: Day, today: Day) => day.wholeDayDiff(today) > 0;

// 오늘의 미체크 회차는 아직 진행 중이므로 연속 기록을 끊지 않는다.
const isPendingToday = (o: RoutineOccurrence, today: Day) => o.state === "un-checked" && o.day.wholeDayDiff(today) === 0;


/**
 * occurrences는 collectOccurrences의 결과처럼 날짜 오름차순이어야 한다.
 * 'failed'이거나 지나간 날의 미체크 회차는 연속 기록을 끊는다.
 */
const computeStreak = (occurrences: RoutineOccurrence[], today: Day): RoutineStreak => {
  const settled = occurrences.filter(o => !isFuture(o.day, today) && !isPendingToday(o, today));

  let longest = 0;
  let run = 0;
  for(const o of settled){
    run = o.state === "accomplished" ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  let current = 0;
  for(let i = settled.length - 1; i >= 0; i--){
    if(settled[i].state !== "accomplished") break;
    current++;
  }

  return { current, longest };
}

// 해당 월의 오늘까지 회차 중 완료한 회차 수. 오늘의 미체크 회차는 예정에는 포함된다.
const summarizeMonth = (occurrences: RoutineOccurrence[], month: Month, today: Day): RoutineMonthSummary => {
  const inMonth = occurrences.filter(o => o.day.isSameMonth(month.startDay) && !isFuture(o.day, today));
  return {
    done: inMonth.filter(o => o.state === "accomplished").length,
    scheduled: inMonth.length,
  };
}


export const RoutineStreakCalculator = {
  collectOccurrences,
  computeStreak,
  summarizeMonth,
}
