import dedent from "dedent";
import { Task } from "../types/task";
import { TaskQueue } from "../types/task-queue";
import { deserializeTask, serializeTask } from "./task";



const deserializeError = (message: string): Error => new Error(`[TaskQueue Deserialization Error]: ${message}`);

export const serializeTaskQueue = (queue: TaskQueue): string => {
  return dedent`
    # Tasks
    ${queue.tasks.map(task => serializeTask(task)).join('\n')}
  `;
}


export const deserializeTaskQueue = (fileContent: string): TaskQueue => {
  const taskSection = fileContent.split(/#\s*Tasks\s*/)[1];
  let tasks: Task[];
  if (!taskSection) {
    tasks = [];
  }
  const taskLines = taskSection.trim().split('\n').filter(line => line.trim() !== '');
  tasks = taskLines.map(line => {
    try {
      return deserializeTask(line);
    } catch (error) {
      throw deserializeError(`Failed to deserialize task: ${line}. Error: ${error}`);
    }
  });

  return { tasks };
}