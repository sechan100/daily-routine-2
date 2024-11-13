import { routineNoteArchiver, routineNoteService } from "@entities/note";
import { Notice } from "obsidian";
import { Day } from "@shared/day";
import { WeeksDayNode } from "./types";



type LoadWeeks = (day: Day, option?: { prev: number; next: number; }) => Promise<{ day: Day; percentage: number; }[][]>;


// week를 로드하는 함수. option은 앞뒤로 추가할 week의 수. prev: -1, next: 2라면 총 4개의 week를 로드한다.
export const loadWeeks: LoadWeeks = async (day, { prev, next } = { prev: 0, next: 0 }) => {
  const start = day.subtractOnClone(prev * 7, "day");
  const end = day.addOnClone((next + 1) * 7, "day").subtract(1, "day"); // week의 시작날짜는 포함이기에 마지막에 하나 빼줘야함.

  const existNotes = await routineNoteArchiver.loadBetween(start, end);
  const nodes: WeeksDayNode[] = existNotes.map(routineNote => {
    const day = routineNote.day;
    const percentage = routineNoteService.getTaskCompletion(routineNote).percentageRounded;
    return { day, percentage };
  })
  
  nodes.sort((a, b) => a.day.isBefore(b.day) ? -1 : 1);


  /**
   * notes은 이미 존재하는 note들만 가져오기때문에, 원래 요청된 사이즈만큼의 노트가 존재하지 않을 수 있음.
   * 때문에 빈노트 element들을 만들어서 채워주어야하는데, 이 때 사용될 수 있는 요청된 사이즈만큼의 배열이 채워졌는지 확인하는 함수.
   */
  const isRequestedSize = () => nodes.length === (prev + next + 1) * 7;

  /**
   * notes의 시작과 끝을 먼저 정해진 경계값으로 채우고, 사이를 매꾸는 방식을 사용한다.
   * 다만, notes중에서 비어있는 노트들이 이 경계값인 경우가 있을 수 있다.
   * 때문에 이를 확인해서 경계값이 비어있는 경우 먼저 채워준다.
   */
  if (nodes.length === 0) { // 아예 가져온 노트가 없다면 경계가 모두 없음
    nodes.push({ day: start.clone(), percentage: 0 });
    nodes.push({ day: end.clone(), percentage: 0 });
  } else {
    if (!nodes[0].day.isSameDay(start)) {
      nodes.unshift({ day: start.clone(), percentage: 0 });
    }
    if (!nodes[nodes.length - 1].day.isSameDay(end)) {
      nodes.push({ day: end.clone(), percentage: 0 });
    }
  }

  // 매꾸기
  for (let i = 0; i + 1 < nodes.length; i++) {
    const note = nodes[i];
    const nextNote = nodes[i + 1];
    const isContinueous = () => note.day.addOnClone(1, "day").isSameDay(nextNote.day);
    if (!isContinueous()) {
      const emptyNote = { day: note.day.addOnClone(1, "day"), percentage: 0 };
      nodes.splice(i + 1, 0, emptyNote);
    }
    if (isRequestedSize()) break;
  }

  // 하나의 배열에 담겨있는 day들을 week의 2차원 배열로 변환
  const weeks: { day: Day; percentage: number; }[][] = new Array(prev + next + 1).fill([]).map(() => []);
  let weekIdx = 0;
  for (const currentDay of nodes) {
    // 최초 week에 추가
    const currentWeek = weeks[weekIdx];
    if (currentWeek.length === 0) {
      currentWeek.push(currentDay);
      continue;
    }
    // 만약 week가 꽉 찼다면 weekIdx를 증가시키고 다음 week에 추가
    if (weeks[weekIdx].length === 7) {
      weekIdx++;
      if (weekIdx >= weeks.length) break;
      weeks[weekIdx].push(currentDay);
      continue;
    }
    weeks[weekIdx].push(currentDay);
  }

  return weeks;
};
