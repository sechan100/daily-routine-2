import { routineManager, Routine } from "@entities/routine";
import { Day } from "@shared/day";


export type TaskType = "routine" | "todo";
export interface Task {
  type: TaskType;
  name: string;
  checked: boolean;
}
export interface RoutineTask extends Task {}
export interface TodoTask extends Task {}

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

  // 특정 task를 check한다.
  checkTask: (routineNote: RoutineNote, task: Task, checked: boolean) => RoutineNote;

  // todo task를 추가한다.
  addTodoTask: (routineNote: RoutineNote, todoTask: TodoTask) => RoutineNote;

  // todo task를 제거한다.
  deleteTodoTask: (routineNote: RoutineNote, todoTaskName: string) => RoutineNote;

  // todo task를 수정한다.
  editTodoTask: (routineNote: RoutineNote, todoTaskName: string, todoTask: TodoTask) => RoutineNote;
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
    type: task.type
  }
  return `- [${checked}] [[${task.name}]]%%${JSON.stringify(data)}%%`;
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
      const name = line.split('] ')[1].split('%%')[0].replace('[[', '').replace(']]', '');
      const data = JSON.parse(line.split('%%')[1].replace('%%', '')) as TaskMetaData;
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

  checkTask(routineNote, task, checked){
    return {
      ...routineNote,
      tasks: routineNote.tasks.map(t => {
        if(t.name === task.name){
          return {
            ...t,
            checked
          }
        } else {
          return t;
        }
      })
    }
  },
  
  addTodoTask(routineNote, todoTask){
    // 중복검사
    if(routineNote.tasks.find(task => task.name === todoTask.name)) throw new Error("Duplicated task name");
    return {
      ...routineNote,
      tasks: [
        todoTask,
        ...routineNote.tasks,
      ]
    }
  },

  deleteTodoTask(routineNote, todoTaskName){
    return {
      ...routineNote,
      tasks: routineNote.tasks.filter(task => task.name !== todoTaskName)
    }
  },

  editTodoTask(routineNote, todoTaskName, todoTask){
    let newNote = routineNote;

    // Name Change
    const originalName = todoTaskName;
    const newName = todoTask.name;
    if(routineNote.tasks.find(task => task.name === newName)) throw new Error("Duplicated task name");
    newNote = {
      ...routineNote,
      tasks: routineNote.tasks.map(task => {
        if(task.name === originalName){
          return {
            ...task,
            ...todoTask,
          }
        } else {
          return task;
        }
      })
    }

    return newNote;
  }
  
}













/**
 * routine으로부터 Task를 유도한다.
 * @param routine
 * @param day
 * @returns RoutineTask | null 만약 routine이 day에 수행어야하는 루틴이 아니라면 null을 반환한다.
 */
const deriveRoutineTask = (routine: Routine, day: Day): RoutineTask | null => {
  /**
   * NOTE: 이 부분은 daysOfWeek와 daysOfMonth를 기준으로 루틴을 수행할지 말지를 결정한다.
   * 특히 daysOfMonth의 경우에는, 0인 경우를 주의해서 처리해야하는데, 이는 매월 마지막 날을 의미한다.
   */

  // MONTH 기준
  if(routine.properties.activeCriteria === "month"){
    const days = Array.from(routine.properties.daysOfMonth);

    // 0이 존재하는 경우, 0을 매개받은 day의 달의 마지막 날짜로 치환한다.
    if(days.contains(0)){
      const lastDayOfMonth = day.moment.daysInMonth();
      days.remove(0);
      days.push(lastDayOfMonth);
    }

    // 오늘이 수행 날짜인지 확인 후 반환
    if(!days.contains(day.getDate())) return null;
  }
  
  // WEEK 기준
  if(routine.properties.activeCriteria === "week"){
    if(!routine.properties.daysOfWeek.contains(day.getDayOfWeek())) return null;
  }
  

  return {
    type: "routine",
    name: routine.name,
    checked: false
  };
};
