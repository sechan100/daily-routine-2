import { ensureArchive } from "@/entities/archives";
import { fileAccessor } from "@/shared/file/file-accessor";
import { compose } from "@/shared/utils/compose";
import { TFile } from "obsidian";
import { GROUP_PREFIX, ROUTINE_PATH } from "../utils";
import { RoutineSerializer } from "./routine-serializer";
import { Routine } from "./routine-type";


export const RoutineRepository = {

  async loadAll() {
    const routinePromises: Promise<Routine>[] = (await ensureArchive("routines")).children
      .flatMap(file => {
        if (file instanceof TFile && !file.name.startsWith(GROUP_PREFIX)) {
          return RoutineSerializer.deserialize(file);
        }
        else {
          return []
        }
      });

    return await Promise.all(routinePromises);
  },

  async load(routineName: string) {
    const path = ROUTINE_PATH(routineName);
    const file = fileAccessor.loadFile(path);
    if (!file) throw new Error('Routine file not found.');
    fileAccessor.loadFrontMatter(file);
    return await RoutineSerializer.deserialize(file);
  },

  async create(routine: Routine) {
    const path = ROUTINE_PATH(routine.name);
    const file = fileAccessor.loadFile(path);
    if (!file) {
      await fileAccessor.createFile(path, RoutineSerializer.serialize(routine));
      return true;
    } else {
      return false;
    }
  },

  async delete(routineName: string) {
    const composed = compose(
      fileAccessor.deleteFile,
      fileAccessor.loadFile,
      ROUTINE_PATH
    );
    await composed(routineName);
  },

  async changeName(originalName: string, newName: string) {
    const file = fileAccessor.loadFile(ROUTINE_PATH(originalName));
    if (!file) throw new Error('Routine file not found.');
    await fileAccessor.renameFileWithLinks(file, ROUTINE_PATH(newName));
  },

  async update(routine: Routine) {
    const file = fileAccessor.loadFile(ROUTINE_PATH(routine.name));
    if (!file) throw new Error('Routine file not found.');
    await fileAccessor.writeFile(file, () => RoutineSerializer.serialize(routine));
    return routine;
  }
}