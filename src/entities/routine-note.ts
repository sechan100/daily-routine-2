import { Day } from "libs/day";



export interface Task {
  name: string;
  checked: boolean;
}
export interface RoutineTask extends Task {}

export interface RoutineNote {
  day: Day;
  tasks: Task[];
}


interface TaskCompletion {
  total: number;
  uncompleted: number;
  completed: number;
  percentage: number;
  percentageRounded: number;
}

export const routineNoteService = {
  getTaskCompletion(routineNote: RoutineNote): TaskCompletion {
    const total = routineNote.tasks.length;
    const completed = routineNote.tasks.filter(task => task.checked).length;
    const uncompleted = total - completed;
    const percentage = total === 0 ? 0 : (completed / total) * 100;
    const percentageRounded = Math.round(percentage);
    return { total, completed, uncompleted, percentage, percentageRounded };
  }
}

