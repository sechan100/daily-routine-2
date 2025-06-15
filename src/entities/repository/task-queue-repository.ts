import { fileAccessor } from "@/shared/file/file-accessor";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { TFile } from "obsidian";
import { deserializeTaskQueue, serializeTaskQueue } from "../serializer/task-queue";
import { TaskQueue } from "../types/task-queue";

const initialQueueFileContent = `# Tasks`;

const ensureTaskQueueFile = async (): Promise<TFile> => {
  const path = useSettingsStores.getState().taksQueueFilePath;
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