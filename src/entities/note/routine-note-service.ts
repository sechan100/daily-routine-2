import { routineManager, Routine } from "@entities/routine";
import { Day } from "@shared/day";
import { RoutineNote, TaskCompletion, Task, TodoTask, TaskMetaData, RoutineTask } from "./types";


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
  const metaData = {
    type: task.type,
    soc: Number(task.showOnCalendar)
  }
  return `- [${checked}] [[${task.name}]]%%${JSON.stringify(metaData)}%%`;
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
        checked,
        showOnCalendar: Boolean(data.soc)
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
      if(routineManager.isRoutineDueTo(routine, day)){
        return routineManager.deriveRoutineToTask(routine);
      } 
      else {
        return [];
      }
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