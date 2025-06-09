import { Task } from "@/entities/task";
import { RoutineNote } from "../types/note";


class NoteTaskUtils {

  findTask(note: RoutineNote, taskName: string): Task {
    const task = note.tasks.find(t => t.name === taskName);
    if (!task) {
      throw new Error(`Task not found: ${taskName}`);
    }
    return task;
  }

  updateTask(note: RoutineNote, taskName: string, newTask: Task): RoutineNote {
    const newNote = { ...note };
    newNote.tasks = newNote.tasks.map(t => {
      if (t.name === taskName) {
        return newTask;
      } else {
        return t;
      }
    });
    return newNote;
  }

  /**
   * Task의 이름을 변경합니다. 
   * 
   * @param note 
   * @param oldName 
   * @param newName 
   * @returns 
   * @throws 같은 이름의 Task가 이미 존재하는 경우 error
   */
  updateTaskName(note: RoutineNote, oldName: string, newName: string): RoutineNote {
    if (this.isExist(note, newName)) {
      throw new Error(`Task with name "${newName}" already exists.`);
    }
    const newNote = { ...note };
    newNote.tasks = newNote.tasks.map(t => {
      if (t.name === oldName) {
        return {
          ...t,
          name: newName
        };
      } else {
        return t;
      }
    });
    return newNote;
  }

  isExist(note: RoutineNote, taskName: string): boolean {
    return note.tasks.some(t => t.name === taskName);
  }
}

export const noteTaskService = new NoteTaskUtils();