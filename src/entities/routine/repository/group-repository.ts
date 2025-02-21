import { fileAccessor } from "@shared/file/file-accessor";
import { GROUP_PATH, GROUP_PREFIX } from "./utils";
import { RoutineGroup } from "../domain/routine-type";
import { stringifyYaml, TFile } from "obsidian";
import { ensureArchive } from "@entities/archives";
import dedent from "dedent";
import { RoutineGroupEntity } from "../domain/routine-group";


const parse = async (file: TFile): Promise<RoutineGroup> => {
  const name = file.basename.startsWith(GROUP_PREFIX) ? file.basename.slice(GROUP_PREFIX.length) : file.basename;
  const properties = RoutineGroupEntity.validateGroupProperties(fileAccessor.loadFrontMatter(file));
  if(properties.isErr()) throw new Error(`[RoutineGroup '${name}' Parse Error] ${properties.error}`);

  return {
    routineElementType: "routine-group",
    name: name,
    properties: properties.value
  }
}

const serialize = (group: RoutineGroup) => dedent`
  ---
  ${stringifyYaml(group.properties)}
  ---
`;

export interface GroupQuery {
  loadAll(): Promise<RoutineGroup[]>;
  load(groupName: string): Promise<RoutineGroup>;
}
export interface GroupRepository extends GroupQuery {
  isExist(groupName: string): boolean;
  persist(group: RoutineGroup): Promise<boolean>;
  delete(groupName: string): Promise<void>;
  update(group: RoutineGroup): Promise<RoutineGroup>; 
  changeName(originalName: string, newName: string): Promise<void>;
}
export const groupRepository: GroupRepository = {

  async loadAll(){
    const groupFiles = (await ensureArchive("routines")).children
      .filter(file => file instanceof TFile)
      .filter(file => file.name.startsWith(GROUP_PREFIX));
    return Promise.all(groupFiles.map(parse));
  },
  
  async load(groupName: string){
    const file = fileAccessor.loadFile(GROUP_PATH(groupName));
    if(!file) throw new Error('Group file not found.');
    return await parse(file);
  },

  isExist(groupName: string){
    return fileAccessor.loadFile(GROUP_PATH(groupName)) !== null;
  },

  async persist(group){
    const path = GROUP_PATH(group.name);
    const file = fileAccessor.loadFile(path);
    if(file) return false;

    await fileAccessor.createFile(path, serialize(group));
    return true;
  },
  
  async delete(groupName: string){
    const file = fileAccessor.loadFile(GROUP_PATH(groupName));
    if(!file) return;
    await fileAccessor.deleteFile(file);
  },
    
  async update(group: RoutineGroup){
    const file = fileAccessor.loadFile(GROUP_PATH(group.name));
    if(!file) throw new Error('Group file not found.');
    await fileAccessor.writeFile(file, () => serialize(group));
    return group;
  },
  
  async changeName(originalName: string, newName: string){
    const file = fileAccessor.loadFile(GROUP_PATH(originalName));
    if(!file) throw new Error('Group file not found.');
    await fileAccessor.renameFileWithLinks(file, GROUP_PATH(newName));
  },
}