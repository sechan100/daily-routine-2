import { RoutineProperties } from 'entities/routine';
import { Task } from 'entities/routine-note';


export type DailyRoutineEvent = {

  updateRoutineProperties: {
    name: string;
    properties: RoutineProperties;
  };

  deleteRoutine: {
    name: string;
  }

  createRoutine: {
    name: string;
  }

  reorderRoutine: {
    tasks: Task[];
  }
}

export type DailyRoutineEventTypes = keyof DailyRoutineEvent;
