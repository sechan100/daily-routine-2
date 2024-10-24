/* eslint-disable fsd-import/layer-imports */

import { RoutineNote, Task } from 'entities/note';
import { RoutineProperties } from 'entities/routine';
import emitter from 'mitt';
import { Day } from './day';


export type DailyRoutineEvent = {

  updateRoutineProperties: {
    name: string;
    properties: RoutineProperties;
  };

  deleteRoutine: {
    name: string;
  };

  createRoutine: {
    name: string;
  };

  reorderTasks: {
    reordered: Task;
    note: RoutineNote;
  };

  // 특정 루틴이 종속되지 않고, 노트에만 의존하는 정보가 변경된 경우
  updateNoteDependents: {
    days: Day[];
  }
};

export type DailyRoutineEventTypes = keyof DailyRoutineEvent;
export const drEvent = emitter<DailyRoutineEvent>();