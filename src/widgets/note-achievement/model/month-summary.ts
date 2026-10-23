import type { Task } from "@entities/note";
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

export type NoteMonthSummary = {
  // 노트가 있는 날 수
  trackedDays: number;
  // 모든 task를 완료(accomplished)한 날 수. task가 하나도 없는 노트는 세지 않는다.
  perfectDays: number;
  totalTasks: number;
  accomplishedTasks: number;
  // accomplishedTasks / totalTasks (0 ~ 100). task가 없으면 0.
  accomplishment: number;
}


/**
 * 노트가 있는 날만 대상으로 한 달의 성과를 집계한다.
 * 미래 날짜의 노트는 아직 수행할 수 없는 task로 비율을 깎으므로 제외한다.
 */
const summarize = (days: DayTasks[], month: Month, today: Day): NoteMonthSummary => {
  const targets = days.filter(({ day }) => day.isSameMonth(month.startDay) && day.wholeDayDiff(today) <= 0);

  let totalTasks = 0;
  let accomplishedTasks = 0;
  let perfectDays = 0;
  for(const { tasks } of targets){
    const accomplished = tasks.filter(t => t.state === "accomplished").length;
    totalTasks += tasks.length;
    accomplishedTasks += accomplished;
    if(tasks.length > 0 && accomplished === tasks.length) perfectDays++;
  }

  return {
    trackedDays: targets.length,
    perfectDays,
    totalTasks,
    accomplishedTasks,
    accomplishment: totalTasks === 0 ? 0 : (accomplishedTasks / totalTasks) * 100,
  };
}


export const NoteMonthSummarizer = {
  summarize,
}
