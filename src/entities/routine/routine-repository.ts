import { plugin } from "@shared/plugin-service-locator";
import { Routine } from "./routine";
import { fileAccessor } from "@shared/file/file-accessor";
import { TFile } from "obsidian";
import { routineSerializer } from "./routine-serializer";
import { compose } from "@shared/compose";
import { DR_SETTING } from "@app/settings/setting-provider";


const ROUTINE_PATH = (routineName: string) =>{
  return `${ROUTINE_FOLDER_PATH()}/${routineName}.md`
}

const ROUTINE_FILE = (routineName: string) => {
  return fileAccessor.getFile(ROUTINE_PATH(routineName));
}

const ROUTINE_FOLDER_PATH = () => {
  const path = DR_SETTING.routineFolderPath();
  if(!path) {
    throw new Error('Routine folder path is not set.');
  }
  return path;
}


const parseRoutineFile = async (file: TFile): Promise<Routine> => {
  const fileContent = await fileAccessor.readFileAsReadonly(file);
  if(!fileContent) {
    throw new Error('Routine file is empty.');
  }
  const name = file.name.replace('.md', '');
  return routineSerializer.deserialize(name, fileContent);
}


interface RoutineRepository {
  /**
   * 모든 루틴들 가져오기
   * orderBy: RoutineProperties.order
   */
  loadAll(): Promise<Routine[]>;

  load(routineName: string): Promise<Routine>;

  persist(routine: Routine): Promise<TFile>;

  delete(routineName: string): Promise<void>;

  update(originalName: string, routine: Routine): Promise<Routine>;
}

export const RoutineRepository: RoutineRepository = {
  async loadAll() {
    const routinePromises: Promise<Routine>[] = fileAccessor.getFolder(ROUTINE_FOLDER_PATH()).children
    .filter(file => file instanceof TFile)
    .map(file => parseRoutineFile(file as TFile));
    
    const routines = await Promise.all(routinePromises);
    return routines.sort((a, b) => a.properties.order - b.properties.order);
  },

  async load(routineName: string) {
    const file = ROUTINE_FILE(routineName);
    return await parseRoutineFile(file);
  },

  persist(routine: Routine) {
    return fileAccessor.createFile(
      ROUTINE_PATH(routine.name),
      routineSerializer.serialize(routine)
    );
  },

  delete: compose(
    fileAccessor.deleteFile, 
    ROUTINE_FILE
  ),

  async update(originalName: string, routine: Routine) {
    const file = ROUTINE_FILE(originalName);
    // name
    if(routine.name !== originalName) {
      await fileAccessor.renameFileWithLinks(file, ROUTINE_PATH(routine.name));
    }
    // properties
    await fileAccessor.writeFrontMatter(file, () => routine.properties);
    return routine;
  }
}