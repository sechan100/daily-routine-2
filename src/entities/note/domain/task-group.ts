import { validateObsidianFileTitle } from "@shared/utils/validate-obsidian-file-title";
import { err, ok, Result } from "neverthrow";
import { isTask, isTaskGroup, RoutineNote, Task, TaskGroup } from "./note.type";



const validateName = (name0: string, groupNames: string[]): Result<string, string> => {
  return validateObsidianFileTitle(name0)
  .andThen(name1 => {
    return groupNames.includes(name1) ? err('duplicated') : ok(name1);
  })
  .andThen(name2 => {
    return name2 === 'UNGROUPED' ? err('reserved-name') : ok(name2);
  })
}

const flatten = (group: TaskGroup): Task[] => {
  return [ ...group.children ]
}

const deleteTaskGroup = (note: RoutineNote, groupName: string, deleteOrphanTasks: boolean): RoutineNote => {
  const newNote = {...note};
  if(deleteOrphanTasks){
    newNote.children = newNote.children.filter(group => !(isTaskGroup(group) && group.name === groupName));
  } else {
    newNote.children = newNote.children
    .flatMap(el => {
      if(isTaskGroup(el) && el.name === groupName){
        return flatten(el);
      }
      return el;
    });
  }
  return newNote;
}



export const TaskGroupEntity = {
  validateName,
  flatten,
  deleteTaskGroup
}