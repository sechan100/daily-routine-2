import { isTask, isTaskGroup, NotePerformance, NoteElement, RoutineNote, Task, TaskGroup, TaskParent } from "./note.type";
import { TaskEntity } from "./task";


const getPerformance = (note: RoutineNote): NotePerformance => {
  const tasks = note.children.flatMap(t => isTaskGroup(t) ? t.children : [t as Task]);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(TaskEntity.isChecked).length;
  const uncompletedTasks = totalTasks - completedTasks;
  const completion = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  const accomplishedTasks = tasks.filter(t => t.state === "accomplished").length;
  const accomplishment = totalTasks === 0 ? 0 : (accomplishedTasks / totalTasks) * 100;
  return { 
    totalTasks,
    completedTasks,
    completion,
    uncompletedTasks,
    accomplishedTasks,
    accomplishment,
  };
}

const getEmptyNotePerformance = (): NotePerformance => {
  return {
    totalTasks: 0,
    completedTasks: 0,
    completion: 0,
    uncompletedTasks: 0,
    accomplishedTasks: 0,
    accomplishment: 0,
  }
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
  getPerformance,
  getEmptyNotePerformance,
  findEl,
  findGroup,
  findTask,
  findParent,
  flatten
}