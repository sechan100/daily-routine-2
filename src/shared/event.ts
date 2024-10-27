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

  reorderRoutine: {
    tasks: Task[];
  };
};

export type DailyRoutineEventTypes = keyof DailyRoutineEvent;
export const drEvent = emitter<DailyRoutineEvent>();