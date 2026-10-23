import { createContext, useContext } from "react";
import { RoutineStreak } from "./streak";


/**
 * 선택한 루틴의 연속 기록. 위젯이 최근 1년 노트로 한 번 계산해서 모든 월 슬라이드에 내려준다.
 * 슬라이드는 VirtualSwiper가 id로 memo하므로 props 대신 context를 쓴다. null이면 계산 중.
 */
export const RoutineStreakContext = createContext<RoutineStreak | null>(null);

export const useRoutineStreak = () => useContext(RoutineStreakContext);
