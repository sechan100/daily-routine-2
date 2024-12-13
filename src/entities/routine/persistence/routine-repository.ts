import { ensureArchive } from "@entities/archives";
import { compose } from "@shared/compose";
import { fileAccessor } from "@shared/file/file-accessor";
import { TFile } from "obsidian";
import { Routine } from "../domain/Routine";
import { GROUP_PREFIX, ROUTINE_PATH } from "./utils";


const parse = async (file: TFile): Promise<Routine> => {
  const fileContent = await fileAccessor.readFileAsReadonly(file);
  if(!fileContent) {
    throw new Error('Routine file is empty.');
  }
  return Routine.fromFile(
    file.basename, 
    fileContent
  );
}

interface RoutineRepository {
  loadAll(): Promise<Routine[]>;
  load(routineName: string): Promise<Routine>;
  persist(entity: Routine): Promise<boolean>;
  delete(routineName: string): Promise<void>;
  changeName(originalName: string, newName: string): Promise<void>;
  update(entity: Routine): Promise<Routine>; 
}
export const RoutineRepository: RoutineRepository = {

  async loadAll(){
    const routinePromises: Promise<Routine>[] = (await ensureArchive("routines")).children
    .filter(file => file instanceof TFile)
    .filter(file => !file.name.startsWith(GROUP_PREFIX))
    .map(file => parse(file as TFile));
    
    return await Promise.all(routinePromises);
  },

  async load(routineName: string){
    const path = ROUTINE_PATH(routineName);
    const file = fileAccessor.loadFile(path);
    if(!file) throw new Error('Routine file not found.');
    return await parse(file);
  },

  async persist(routine: Routine){
    const path = ROUTINE_PATH(routine.getName());
    const file = fileAccessor.loadFile(path);
    if(!file){
      await fileAccessor.createFile(path, routine.serialize());
      return true;
    } else {
      return false;
    }
  },
  
  async delete(routineName: string){
    const composed = compose(
      fileAccessor.deleteFile,
      fileAccessor.loadFile,
      ROUTINE_PATH
    );
    await composed(routineName);
  },

  async changeName(originalName: string, newName: string){
    const file = fileAccessor.loadFile(ROUTINE_PATH(originalName));
    if(!file) throw new Error('Routine file not found.');
    await fileAccessor.renameFileWithLinks(file, ROUTINE_PATH(newName));
  },
  
  async update(routine: Routine){
    const file = fileAccessor.loadFile(ROUTINE_PATH(routine.getName()));
    if(!file) throw new Error('Routine file not found.');
    await fileAccessor.writeFrontMatter(file, () => routine.getProperties().serialize());
    return routine;
  },
}