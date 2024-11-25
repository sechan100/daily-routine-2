import { Day } from "@shared/period/day";
import { RoutineNote, TaskCompletion, Task, TodoTask, TaskMetaData } from "./types";
import { Routine, RoutineService } from "@entities/routine";


interface NoteService {
  getTaskCompletion(routineNote: RoutineNote): TaskCompletion;

  serialize(routineNote: RoutineNote): string;

  deserialize(day: Day, content: string): RoutineNote;

  /**
   * @param loader curring을 통해서 loader에 대한 의존을 주입한다.
   * 이 때, loader가 반환하는 routine들은 적절한 평가를 거쳐서 최종 RoutineNote 데이터에 반영된다.
   */
  setLoaderForCreateAsync(loader: () => Promise<Routine[]>): (day: Day) => Promise<RoutineNote>;
  setLoaderForCreate(loader: () => Routine[]): (day: Day) => RoutineNote;

  checkTask(routineNote: RoutineNote, task: Task, checked: boolean): RoutineNote;

  addTodoTask(routineNote: RoutineNote, todoTask: TodoTask): RoutineNote;

  deleteTodoTask(routineNote: RoutineNote, todoTaskName: string): RoutineNote;

  editTodoTask(routineNote: RoutineNote, originalName: string, todoTask: TodoTask): RoutineNote;
}

export const NoteService: NoteService = {
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
      day: day.clone(),
      tasks
    };
  },

  setLoaderForCreate: (loader) => (day) => {
    const routines = loader();
    const tasks = routines.flatMap(routine => {
      if(RoutineService.isRoutineDueTo(routine, day)){
        return RoutineService.deriveRoutineToTask(routine);
      } 
      else {
        return [];
      }
    });
    return {
      day: day.clone(),
      tasks: tasks
    };
  },

  setLoaderForCreateAsync: (loader) => async (day) => {
    const routines = await loader();
    return NoteService.setLoaderForCreate(() => routines)(day);
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

  editTodoTask(routineNote, originalName, todoTask){
    const newName = todoTask.name;
    if(originalName !== newName && routineNote.tasks.some(task => task.name === newName)){
      throw new Error("Duplicated task name");
    }

    const newTasks: Task[] = routineNote.tasks.map(task => {
      if(task.name === originalName){
        return {
          ...task,
          ...todoTask,
        }
      } else {
        return task;
      }
    });

    return {
      ...routineNote,
      tasks: newTasks
    }
  }
  
}