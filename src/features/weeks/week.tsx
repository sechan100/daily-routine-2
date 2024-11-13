import { routineNoteArchiver, routineNoteService } from "@entities/note";
import { Day } from "@shared/day";


export class Week {
  #startDay: Day;

  constructor(day: Day) {
    this.#startDay = day.clone(m => m.startOf("week"));
  }

  get startDay() {
    return this.#startDay;
  }

  get endDay() {
    return this.#startDay.clone(m => m.endOf("week"));
  }

  add(amount: number) {
    return new Week(
      this.#startDay.add(amount * 7, "day")
    );
  }

  subtract(amount: number) {
    return new Week(
      this.#startDay.subtract(amount * 7, "day")
    );
  }
  
}

export type DayNode = {
  day: Day;
  percentage: number;
};

type LoadWeeks = (week: Week, option?: { prev: number; next: number; }) => Promise<DayNode[][]>;


export const loadWeeks: LoadWeeks = async (week, { prev, next } = { prev: 0, next: 0 }) => {
  const startWeek = week.subtract(prev);
  const startDay = startWeek.startDay;
  const endWeek = week.add(next);
  const endDay = endWeek.endDay;
  const realNotes = await routineNoteArchiver.loadBetween(startDay, endDay);
  // 일단 실제로 가져온 노트들을 기반으로 dayNodes의 기본 틀을 만든다.
  const dayNodes: DayNode[] = realNotes.map(note => ({
    day: note.day,
    percentage: routineNoteService.getTaskCompletion(note).percentageRounded
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

    const intendedNextDay = node.day.add(1, "day");
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