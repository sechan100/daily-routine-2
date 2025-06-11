import { Task, TaskProperties } from "@/entities/task";
import { produce } from "immer";


class NoteTaskUtils {

  findTask(tasks: Task[], taskName: string): Task {
    const task = tasks.find(t => t.name === taskName);
    if (!task) {
      throw new Error(`Task not found: ${taskName}`);
    }
    return task;
  }

  updateTaskProperties(task: Task[], taskName: string, newProperties: TaskProperties): Task[] {
    return produce(task, draft => {
      const foundTask = draft.find(t => t.name === taskName);
      if (!foundTask) {
        throw new Error(`Task not found: ${taskName}`);
      }
      foundTask.properties = newProperties;
    });
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
  rename(tasks: Task[], oldName: string, newName: string): Task[] {
    if (tasks.some(t => t.name === newName)) {
      throw new Error(`Task with name "${newName}" already exists.`);
    }
    return produce(tasks, draft => {
      const foundTask = draft.find(t => t.name === oldName);
      if (!foundTask) {
        throw new Error(`Task not found: ${oldName}`);
      }
      foundTask.name = newName;
    });
  }

}

export const noteTaskUtils = new NoteTaskUtils();