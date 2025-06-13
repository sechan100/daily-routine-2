import { addTaskToQueue } from '@/features/task-queue';
import { Notice } from 'obsidian';
import DailyRoutinePlugin from "src/main";


export const initObsidianProtocalHandler = (plugin: DailyRoutinePlugin) => {
  // queue에 새로운 task 만들기 action
  plugin.registerObsidianProtocolHandler("daily-routine", async (query) => {
    const cmd = query.cmd;
    if (cmd === "add-task") {
      const name = query.name;
      if (!name) {
        throw new Error("Task name is required for add-task action");
      }
      await addTaskToQueue(name);
      new Notice("Task added to queue: " + name);
    }
  });
}