import { NoteRepository, NoteService } from "@entities/note";
import { Day } from "@shared/period/day";
import { Week } from "@shared/period/week";


export type DayNode = {
  day: Day;
  percentage: number;
};

type LoadWeeks = (week: Week, option?: { prev: number; next: number; }) => Promise<DayNode[][]>;


export const loadWeeks: LoadWeeks = async (week, { prev, next } = { prev: 0, next: 0 }) => {
  const startWeek = week.subtract_cpy(prev);
  const startDay = startWeek.startDay;
  const endWeek = week.add_cpy(next);
  const endDay = endWeek.endDay;
  const realNotes = await NoteRepository.loadBetween(startDay, endDay);
  // 일단 실제로 가져온 노트들을 기반으로 dayNodes의 기본 틀을 만든다.
  const dayNodes: DayNode[] = realNotes.map(note => ({
    day: note.day,
    percentage: NoteService.getTaskCompletion(note).percentageRounded
  }))  
  dayNodes.sort((a, b) => a.day.isBefore(b.day) ? -1 : 1);

  // dayNodes를 temp 값들로 채우기 전에, 경계값을 설정해주기
  if (dayNodes.length === 0 || !dayNodes[0].day.isSameDay(startDay)) {
    dayNodes.unshift(getTempDayNode(startDay));
  }
  if(!dayNodes[dayNodes.length - 1].day.isSameDay(endDay)){
    dayNodes.push(getTempDayNode(endDay));
  }

  // dayNodes를 temp 값들로 매꾸기
  const isDayNodesFull = () => dayNodes.length === (prev + next + 1) * 7;
  for(let i = 0; i < dayNodes.length; i++) {
    const node = dayNodes[i];
    const nextNode = dayNodes[i + 1];

    const intendedNextDay = node.day.clone(m => m.add(1, "day"));
    const isContinueous = intendedNextDay.isSameDay(nextNode.day);
    if(!isContinueous){
      const tempNode = getTempDayNode(intendedNextDay);
      dayNodes.splice(i + 1, 0, tempNode);
    }

    if(isDayNodesFull()) break;
  }

  // dayNodes를 2차원 배열로 변환
  const weeks: DayNode[][] = new Array(prev + next + 1).fill([]).map(() => []);
  let weekIdx = 0;
  for(const node of dayNodes) {
    const week = weeks[weekIdx];
    week.push(node);

    if(week.length === 7){
      if(++weekIdx === weeks.length) break;
    }
  }

  return weeks;
};


const getTempDayNode = (day: Day) => ({ day, percentage: 0 });