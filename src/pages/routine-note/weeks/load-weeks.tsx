import { getNoteProgress } from "@/core/note/get-note-progress";
import { noteRepository } from "@/entities/repository/note-repository";
import { ZERO_NOTE_PROGRESS } from "@/entities/types/progress";
import { Day } from "@/shared/period/day";
import { Week } from "@/shared/period/week";
import { DayNode, WeekNode } from "./types";

const getFallbackNode = (day: Day): DayNode => ({ day, progress: ZERO_NOTE_PROGRESS });

export type LoadWeekNodes = (week: Week, option?: { prev: number; next: number; }) => Promise<WeekNode[]>;

export const loadWeekNodes: LoadWeekNodes = async (week, { prev, next } = { prev: 0, next: 0 }) => {
  const startWeek = week.subtract_cpy(prev);
  const startDay = startWeek.startDay;
  const endWeek = week.add_cpy(next);
  const endDay = endWeek.endDay;

  const realNotes = await noteRepository.loadBetween(startDay, endDay);
  // 일단 실제로 가져온 노트들을 기반으로 dayNodes의 기본 틀을 만든다.
  const dayNodes: DayNode[] = realNotes.map(note => ({
    day: note.day,
    progress: getNoteProgress(note)
  }))
  dayNodes.sort((a, b) => a.day.isBefore(b.day) ? -1 : 1);

  // dayNodes를 temp 값들로 채우기 전에, 경계값을 설정해주기
  if (dayNodes.length === 0 || !dayNodes[0].day.isSameDay(startDay)) {
    dayNodes.unshift(getFallbackNode(startDay));
  }
  if (!dayNodes[dayNodes.length - 1].day.isSameDay(endDay)) {
    dayNodes.push(getFallbackNode(endDay));
  }

  // dayNodes를 temp 값들로 매꾸기
  const isDayNodesFull = () => dayNodes.length === (prev + next + 1) * 7;
  for (let i = 0; i < dayNodes.length; i++) {
    const node = dayNodes[i];
    const nextNode = dayNodes[i + 1];

    const intendedNextDay = node.day.clone(m => m.add(1, "day"));
    const isContinueous = intendedNextDay.isSameDay(nextNode.day);
    if (!isContinueous) {
      const tempNode = getFallbackNode(intendedNextDay);
      dayNodes.splice(i + 1, 0, tempNode);
    }

    if (isDayNodesFull()) break;
  }

  // dayNodes를 2차원 배열로 변환
  const weeks: WeekNode[] = Array.from({ length: prev + next + 1 }, () => ({
    key: null as unknown as string,
    week: null as unknown as Week,
    days: [],
  }));
  let weekIdx = 0;
  for (const node of dayNodes) {
    const week = weeks[weekIdx];

    if (week.week === null) week.week = Week.of(node.day);
    week.days.push(node);

    if (week.days.length === 7) {
      if (++weekIdx === weeks.length) break;
    }
  }

  return weeks;
};