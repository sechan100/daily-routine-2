import { deserializeTask, serializeTask } from "@/entities/task";
import dedent from "dedent";
import { TaskQueue } from "./task-queue";






const deserializeError = (message: string): Error => new Error(`[TaskQueue Deserialization Error]: ${message}`);


export const serializeTaskQueue = (queue: TaskQueue): string => {
  return dedent`
    # Tasks
    ${queue.tasks.map(task => serializeTask(task)).join('\n')}
  `;
}



export const deserializeTaskQueue = (fileContent: string): TaskQueue => {
  const taskSection = fileContent.split(/#\s*Tasks\s*/)[1];
  if (!taskSection) {
    throw deserializeError("No '#Tasks' header section found in the file content.");
  }
  const taskLines = taskSection.trim().split('\n').filter(line => line.trim() !== '');
  const tasks = taskLines.map(line => {
    try {
      return deserializeTask(line);
    } catch (error) {
      throw deserializeError(`Failed to deserialize task: ${line}. Error: ${error}`);
    }
  });

  return { tasks };
}