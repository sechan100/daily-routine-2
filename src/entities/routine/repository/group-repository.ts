import { fileAccessor } from "@shared/file/file-accessor";
import { GROUP_PATH, GROUP_PREFIX } from "./utils";
import { RoutineGroup } from "../domain/routine-type";
import { Notice, stringifyYaml, TFile } from "obsidian";
import { t } from "@shared/i18n";
import { ensureArchive } from "@entities/archives";
import { RoutineGroupEntity } from "../domain/routine-group";


const parse = async (file: TFile): Promise<RoutineGroup> => {
  const fm = await fileAccessor.loadFrontMatter(file);
  const name = file.basename.startsWith(GROUP_PREFIX) ? file.basename.slice(GROUP_PREFIX.length) : file.basename;
  const properties = RoutineGroupEntity.validateGroupProperties(fm);
  if(properties.isErr()) throw new Error(`[RoutineGroup '${name}' Parse Error] ${properties.error}`);

  return {
    routineElementType: "routine-group",
    name: name,
    properties: properties.value
  }
}

// 읽지 못한 그룹 파일과 그 이유
export type GroupLoadFailure = {
  path: string;
  message: string;
}

// loadAll은 날짜를 옮길 때마다 불리므로, 같은 파일의 같은 오류는 한 번만 알린다.
const reportedParseErrors = new Set<string>();
const notifyParseErrorOnce = ({ path, message }: GroupLoadFailure) => {
  const key = `${path}\n${message}`;
  if(reportedParseErrors.has(key)) return;
  reportedParseErrors.add(key);
  console.error(`[Daily Routine] Skipped group file '${path}'. ${message}`);
  new Notice(t("tasks.file.skipped", { path, message }));
}

// dedent 같은 template tag는 보간된 YAML의 '\n' 같은 escape를 해석하고 들여쓰기도 깎으므로, 줄을 join해서 만든다.
const serialize = (group: RoutineGroup) => ['---', stringifyYaml(group.properties), '---'].join('\n');

export interface GroupQuery {
  // 읽지 못한 그룹 파일은 (파일마다 한 번) 알리고 건너뛴다.
  loadAll(): Promise<RoutineGroup[]>;
  // 읽지 못한 그룹 파일을 건너뛰지 않고 함께 반환한다. 일부만 읽은 목록으로 노트를 다시 만들면 안 되는 곳(병합)에서 쓴다.
  loadAllSettled(): Promise<{ items: RoutineGroup[]; failures: GroupLoadFailure[] }>;
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
    // 형식이 깨진 그룹 파일 하나 때문에 노트 생성 전체가 실패하지 않도록, 읽지 못한 그룹은 알리고 건너뛴다.
    const { items, failures } = await groupRepository.loadAllSettled();
    failures.forEach(notifyParseErrorOnce);
    return items;
  },

  async loadAllSettled(){
    const groupFiles = (await ensureArchive("routines")).children
      .filter((file): file is TFile => file instanceof TFile && file.extension === "md")
      .filter(file => file.name.startsWith(GROUP_PREFIX));

    const results = await Promise.allSettled(groupFiles.map(parse));
    const items: RoutineGroup[] = [];
    const failures: GroupLoadFailure[] = [];
    results.forEach((result, i) => {
      if(result.status === "fulfilled") items.push(result.value);
      else failures.push({ path: groupFiles[i].path, message: result.reason instanceof Error ? result.reason.message : String(result.reason) });
    });
    return { items, failures };
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
    // 사용자가 작성한 본문을 보존하기 위해서 frontmatter만 수정한다.
    await fileAccessor.writeFrontMatter(file, () => group.properties);
    return group;
  },
  
  async changeName(originalName: string, newName: string){
    const file = fileAccessor.loadFile(GROUP_PATH(originalName));
    if(!file) throw new Error('Group file not found.');
    await fileAccessor.renameFileWithLinks(file, GROUP_PATH(newName));
  },
}