import { Day } from "shared/day";
import { Routine, routineManager } from "./routine";
import moment from "obsidian";



export type TaskType = "routine" | "todo";
export interface Task {
  type: TaskType;
  name: string;
  checked: boolean;
}
export interface RoutineTask extends Task {}

export interface RoutineNote {
  day: Day;
  tasks: Task[];
}



interface TaskMetaData {
  type: TaskType;
}

interface TaskCompletion {
  total: number;
  uncompleted: number;
  completed: number;
  percentage: number;
  percentageRounded: number;
}


interface RoutineNoteService {
  // 루틴 노트의 성취도를 계산한다.
  getTaskCompletion: (routineNote: RoutineNote) => TaskCompletion;

  // 루틴 노트를 문자열로 변환한다.
  serialize: (routineNote: RoutineNote) => string;

  // 문자열을 루틴 노트로 변환한다.
  deserialize: (day: Day, content: string) => RoutineNote;

  // 새로운 루틴 노트를 생성한다. 
  create: (day: Day) => Promise<RoutineNote>;

  // 루틴 노트의 특정 task를 체크, 혹은 체크해제한다.
  checkTask: (routineNote: RoutineNote, taskName: string, checked: boolean) => void;

  // task의 순서를 변경한다.
  replaceTask: (cmd: {
    routineNote: RoutineNote,
    taskName: string, 
    targetTaskName: string, 
    cmd: 'before' | 'after'
  }) => void;
}

export const routineNoteService: RoutineNoteService = {
  getTaskCompletion(routineNote){
    const total = routineNote.tasks.length;
    const completed = routineNote.tasks.filter(task => task.checked).length;
    const uncompleted = total - completed;
    const percentage = total === 0 ? 0 : (completed / total) * 100;
    const percentageRounded = Math.round(percentage);
    return { total, completed, uncompleted, percentage, percentageRounded };
  },

  serialize(routineNote){
    const content =
`---
---
# Tasks
${routineNote.tasks.map(task => {
  const checked = task.checked ? 'x' : ' ';
  const data = {
    type: "routine"
  }
  return `- [${checked}] [[${task.name}]]<!-- ${JSON.stringify(data)} -->`;
}).join('\n')}
`;
    return content;
  },
  
  deserialize(day, content){
    // const props = parseProperties(content);
    // "# Tasks" 이후의 내용을 tasks로 변환한다.
    const tasks: Task[] = content.split('# Tasks')[1].split('\n').flatMap(line => {
      if(line.trim() === '') return [];
      const checked = line.startsWith('- [x]');
      const name = line.split('] ')[1].split('<!--')[0].replace('[[', '').replace(']]', '');
      const data = JSON.parse(line.split('<!-- ')[1].replace(' -->', '')) as TaskMetaData;
      return {
        type: data.type,
        name, 
        checked 
      };
    });

    return {
      day,
      tasks
    };
  },

  async create(day){
    const routines = await routineManager.getAllRoutines();
    const tasks = routines.flatMap(routine => {
      const taskOrNull = deriveRoutineTask(routine, day);
      if(taskOrNull) return taskOrNull;
      else return [];
    });
    return {
      day: day,
      tasks: tasks
    };
  },

  checkTask(routineNote, taskName, checked){
    const task = routineNote.tasks.find(task => task.name === taskName);
    if(task){
      task.checked = checked;
    } else {
      throw new Error(`Task ${taskName} not found.`);
    }
  },

  replaceTask({ routineNote, taskName, targetTaskName, cmd }){
    const task = routineNote.tasks.find(task => task.name === taskName);
    if(!task) throw new Error(`Task ${taskName} not found.`);

    const targetTask = routineNote.tasks.find(task => task.name === targetTaskName);
    if(!targetTask) throw new Error(`Target task ${targetTaskName} not found.`);

    const taskIdx = routineNote.tasks.indexOf(task);
    const targetTaskIdx = routineNote.tasks.indexOf(targetTask);

    if(cmd === 'before'){
      routineNote.tasks.splice(taskIdx, 1);
      routineNote.tasks.splice(targetTaskIdx, 0, task);
    } else if(cmd === 'after'){
      routineNote.tasks.splice(taskIdx, 1);
      routineNote.tasks.splice(targetTaskIdx + 1, 0, task);
    }
  },
  
  
}













/**
 * routine으로부터 Task를 파생시킨다.
 * @param routine
 * @param day
 * @returns RoutineTask | null 만약 routine이 day에 수행어야하는 루틴이 아니라면 null을 반환한다.
 */
const deriveRoutineTask = (routine: Routine, day: Day): RoutineTask | null => {
  if (!routine.properties.dayOfWeeks.contains(day.getDayOfWeek())) return null;

  return {
    type: "routine",
    name: routine.name,
    checked: false
  };
};
