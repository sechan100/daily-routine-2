import { ensureArchive } from "@entities/archives";
import { compose } from "@shared/utils/compose";
import { fileAccessor } from "@shared/file/file-accessor";
import { Notice, stringifyYaml, TFile } from "obsidian";
import { GROUP_PREFIX, ROUTINE_PATH } from "./utils";
import { RoutineEntity } from "../domain/routine";
import dedent from "dedent";
import { Routine } from "../domain/routine-type";


/**
 * File을 받아서 Routine 객체로 변환한다.
 * 
 * 루틴을 저장소에서 읽어와 변환하는 로직은 모두 해당 함수를 사용한다.
 * @param file 
 * @returns 
 */
const parse = async (file: TFile): Promise<Routine> => {
  const fm = await fileAccessor.loadFrontMatter(file);
  const result = RoutineEntity.validateRoutineProperties(fm);
  if(result.isErr()){
    new Notice(`Routine '${file.basename}' frontmatter error: ${result.error}`);
    throw new Error(`[Routine '${file.basename}' Parse Error] ${result.error}`);
  }
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
  create(entity: Routine): Promise<boolean>;
  delete(routineName: string): Promise<void>;
  changeName(originalName: string, newName: string): Promise<void>;
  update(routine: Routine): Promise<Routine>;
  updateAll(routines: Routine[]): Promise<Routine[]>;
}
export const routineRepository: RoutineRepository = {

  async loadAll(){
    const routinePromises: Promise<Routine>[] = (await ensureArchive("routines")).children
    .flatMap(file => {
      if(file instanceof TFile && !file.name.startsWith(GROUP_PREFIX)){
        return parse(file);
      }
      else {
        return []
      }
    });
    
    return await Promise.all(routinePromises);
  },

  async load(routineName: string){
    const path = ROUTINE_PATH(routineName);
    const file = fileAccessor.loadFile(path);
    if(!file) throw new Error('Routine file not found.');
    fileAccessor.loadFrontMatter(file);
    return await parse(file);
  },

  async create(routine: Routine){
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