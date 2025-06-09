/* eslint-disable @typescript-eslint/no-explicit-any */
import { Day } from "@/shared/period/day";
import { Task } from "../../task/types/task";
import { RoutineTree } from "./routine-tree";


export type RoutineNote = {

  day: Day;

  /**
   * RoutineNote의 데이터 영역을 제외한 부분의 전체 markdown 문자열
   */
  userContent: string;

  tasks: Task[];

  /**
   * Routine, RoutineGroup을 포함한 Root 배열
   */
  routineTree: RoutineTree;
}