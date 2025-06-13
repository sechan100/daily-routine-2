import { fileAccessor } from "@/shared/file/file-accessor";
import { getSettings } from "@/shared/settings";
import { TFile } from "obsidian";
import { deserializeTaskQueue, serializeTaskQueue } from "./serialize-queue";
import { TaskQueue } from "./task-queue";

const initialQueueFileContent = `# Tasks`;

const ensureTaskQueueFile = async (): Promise<TFile> => {
  const path = getSettings().taksQueueFilePath;
  let file = fileAccessor.loadFile(path);
  if (!file) {
    file = await fileAccessor.createFile(path, initialQueueFileContent);
  }
  return file;
};

class TaskQueueRepository {

  async load(): Promise<TaskQueue> {
    const file = await ensureTaskQueueFile();
    const fileContent = await fileAccessor.readFileFromDisk(file);
    return deserializeTaskQueue(fileContent);
  }

  async update(taskQueue: TaskQueue): Promise<void> {
    const file = await ensureTaskQueueFile();
    await fileAccessor.writeFile(file, () => serializeTaskQueue(taskQueue));
  }


}

export const taskQueueRepository = new TaskQueueRepository();