import { ensureArchive } from "@entities/archives";
import { compose } from "@shared/compose";
import { fileAccessor } from "@shared/file/file-accessor";
import { stringifyYaml, TFile } from "obsidian";
import { GROUP_PREFIX, ROUTINE_PATH } from "./utils";
import { parseFrontmatter } from "@shared/file/parse-frontmatter";
import { RoutineEntity } from "../domain/routine";
import dedent from "dedent";
import { Routine } from "../domain/routine.type";


const parse = async (file: TFile): Promise<Routine> => {
  const content = await fileAccessor.readFileAsReadonly(file);
  const result = RoutineEntity.validateRoutineProperties(parseFrontmatter(content));
  if(result.isErr()) throw new Error(`[Routine '${file.basename}' Parse Error] ${result.error}`);
  return {
    name: file.basename,
    routineElementType: "routine",
    properties: result.value
  }
}

const serialize = (routine: Routine) => dedent`
  ---
  ${stringifyYaml(routine.properties)}
  ---
`;

export interface RoutineQuery {
  loadAll(): Promise<Routine[]>;
  load(routineName: string): Promise<Routine>;
}
export interface RoutineRepository extends RoutineQuery {
  persist(entity: Routine): Promise<boolean>;
  delete(routineName: string): Promise<void>;
  changeName(originalName: string, newName: string): Promise<void>;
  update(routine: Routine): Promise<Routine>;
  updateAll(routines: Routine[]): Promise<Routine[]>;
}
export const routineRepository: RoutineRepository = {

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
    fileAccessor.loadFrontMatter(file);
    return await parse(file);
  },

  async persist(routine: Routine){
    const path = ROUTINE_PATH(routine.name);
    const file = fileAccessor.loadFile(path);
    if(!file){
      await fileAccessor.createFile(path, serialize(routine));
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
    const file = fileAccessor.loadFile(ROUTINE_PATH(routine.name));
    if(!file) throw new Error('Routine file not found.');
    await fileAccessor.writeFile(file, () => serialize(routine));
    return routine;
  },

  async updateAll(routines: Routine[]){
    const promises = routines.map(routine => routineRepository.update(routine));
    return await Promise.all(promises);
  }
}