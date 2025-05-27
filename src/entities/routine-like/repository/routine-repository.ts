import { ensureFolder } from "@/shared/file/ensure-folder";
import { fileAccessor } from "@/shared/file/file-accessor";
import { SETTINGS } from "@/shared/settings";
import { compose } from "@/shared/utils/compose";
import { TFile } from "obsidian";
import { Routine } from "../model/routine";
import { createNewSerializedRoutine, deserializeRoutine, serializeRoutine } from "./serialize/routine";


const getRoutinePath = (routineName: string) => {
  return `${SETTINGS.getRoutineFolderPath()}/${routineName}.md`;
}


interface RoutineRepository {
  loadAll(): Promise<Routine[]>;
  load(routineName: string): Promise<Routine>;
  persist(routine: Routine): Promise<Routine>;
  delete(routineName: string): Promise<void>;
  changeName(originalName: string, newName: string): Promise<void>;
  update(routine: Routine): Promise<Routine>;
}
export const routineRepository: RoutineRepository = {

  async loadAll() {
    const routinePromises: Promise<Routine>[] = (await ensureFolder(SETTINGS.getRoutineFolderPath()))
      .children
      .flatMap(file => file instanceof TFile ? deserializeRoutine(file) : []);

    return await Promise.all(routinePromises);
  },

  async load(routineName: string) {
    const path = getRoutinePath(routineName);
    const file = fileAccessor.loadFile(path);
    if (!file) throw new Error('Routine file not found.');
    fileAccessor.loadFrontMatter(file);
    return await deserializeRoutine(file);
  },

  async persist(routine: Routine) {
    const path = getRoutinePath(routine.name);
    const file = fileAccessor.loadFile(path);
    if (!file) {
      await fileAccessor.createFile(path, createNewSerializedRoutine(routine));
      return routine;
    } else {
      throw new Error(`Routine with name '${routine.name}' already exists.`);
    }
  },

  async delete(routineName: string) {
    const composed = compose(
      fileAccessor.deleteFile,
      fileAccessor.loadFile,
      getRoutinePath
    );
    await composed(routineName);
  },

  async changeName(originalName: string, newName: string) {
    const file = fileAccessor.loadFile(getRoutinePath(originalName));
    if (!file) throw new Error('Routine file not found.');
    await fileAccessor.renameFileWithLinks(file, getRoutinePath(newName));
  },

  async update(routine: Routine) {
    const file = fileAccessor.loadFile(getRoutinePath(routine.name));
    if (!file) throw new Error('Routine file not found.');
    await fileAccessor.writeFile(file, (content) => serializeRoutine(content, routine));
    return routine;
  }
}