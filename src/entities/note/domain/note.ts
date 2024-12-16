import { isTask, isTaskGroup, NoteCompletion, NoteElement, RoutineNote, Task, TaskGroup, TaskParent } from "./note.type";


const getCompletion = (note: RoutineNote): NoteCompletion => {
  const tasks = note.children.flatMap(t => isTaskGroup(t) ? t.children : [t as Task]);
  const total = tasks.length;
  const completed = tasks.filter(t => t.checked).length;
  const uncompleted = total - completed;
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  const percentageRounded = Math.round(percentage);
  return { total, completed, uncompleted, percentage, percentageRounded };
}

const findEl = (parent: TaskParent, name: string): NoteElement | null => {
  for(const el of parent.children){
    if(isTaskGroup(el)){
      if(el.name === name){
        return el;
      } else {
        const rs = findEl(el, name);
        if(rs) return rs;
      }
    } else if(isTask(el)){
      if(el.name === name) return el;
    }
  }
  return null;
}

const findGroup = (note: RoutineNote, name: string): TaskGroup | null => {
  const rs = findEl(note, name);
  return rs && isTaskGroup(rs) ? rs : null;
}

const findTask = (note: RoutineNote, name: string): Task | null => {
  const rs = findEl(note, name);
  return rs && isTask(rs) ? rs : null;
}

const findParent = (note: RoutineNote, name: string): TaskParent => {
  for(const el of note.children){
    if(isTaskGroup(el)){
      if(el.name === name){
        return note;
      } else {
        for(const t of el.children){
          if(t.name === name) return el;
        }
      }
    } else if(isTask(el)){
      if(el.name === name) return note;
    }
  }
  throw new Error(`Task or Group not found: ${name}`);
}

const flatten = (note: RoutineNote): Task[] => {
  return note.children.flatMap(t => isTaskGroup(t) ? t.children : [t as Task]);
}


export const NoteEntity = {
  getCompletion,
  findEl,
  findGroup,
  findTask,
  findParent,
  flatten
}