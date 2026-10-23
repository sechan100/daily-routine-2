import { ensureArchive } from "@entities/archives";
import { fileAccessor } from "@shared/file/file-accessor";
import { Notice, stringifyYaml, TFile } from "obsidian";
import { t } from "@shared/i18n";
import { GROUP_PREFIX, ROUTINE_PATH } from "./utils";
import { RoutineEntity } from "../domain/routine";
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
    throw new Error(`Routine '${file.basename}' frontmatter error: ${result.error}`);
  }
  return {
    name: file.basename,
    routineElementType: "routine",
    properties: result.value
  }
}

// 읽지 못한 루틴 파일과 그 이유
export type RoutineLoadFailure = {
  path: string;
  message: string;
}

// loadAll은 날짜를 옮길 때마다 불리므로, 같은 파일의 같은 오류는 한 번만 알린다.
const reportedParseErrors = new Set<string>();
const notifyParseErrorOnce = ({ path, message }: RoutineLoadFailure) => {
  const key = `${path}\n${message}`;
  if(reportedParseErrors.has(key)) return;
  reportedParseErrors.add(key);
  console.error(`[Daily Routine] Skipped routine file '${path}'. ${message}`);
  new Notice(t("tasks.file.skipped", { path, message }));
}

// dedent 같은 template tag는 보간된 YAML의 '\n' 같은 escape를 해석하고 들여쓰기도 깎으므로, 줄을 join해서 만든다.
const serialize = (routine: Routine) => ['---', stringifyYaml(routine.properties), '---'].join('\n');

export interface RoutineQuery {
  // 읽지 못한 루틴 파일은 (파일마다 한 번) 알리고 건너뛴다.
  loadAll(): Promise<Routine[]>;
  // 읽지 못한 루틴 파일을 건너뛰지 않고 함께 반환한다. 일부만 읽은 목록으로 노트를 다시 만들면 안 되는 곳(병합)에서 쓴다.
  loadAllSettled(): Promise<{ items: Routine[]; failures: RoutineLoadFailure[] }>;
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
    // 형식이 깨진 루틴 파일 하나 때문에 노트 생성 전체가 실패하지 않도록, 읽지 못한 루틴은 알리고 건너뛴다.
    const { items, failures } = await routineRepository.loadAllSettled();
    failures.forEach(notifyParseErrorOnce);
    return items;
  },

  async loadAllSettled(){
    const routineFiles = (await ensureArchive("routines")).children
    .filter((file): file is TFile => file instanceof TFile && file.extension === "md" && !file.name.startsWith(GROUP_PREFIX));

    const results = await Promise.allSettled(routineFiles.map(parse));
    const items: Routine[] = [];
    const failures: RoutineLoadFailure[] = [];
    results.forEach((result, i) => {
      if(result.status === "fulfilled") items.push(result.value);
      else failures.push({ path: routineFiles[i].path, message: result.reason instanceof Error ? result.reason.message : String(result.reason) });
    });
    return { items, failures };
  },

  async load(routineName: string){
    const path = ROUTINE_PATH(routineName);
    const file = fileAccessor.loadFile(path);
    if(!file) throw new Error('Routine file not found.');
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
    const file = fileAccessor.loadFile(ROUTINE_PATH(routineName));
    if(!file) return;
    await fileAccessor.deleteFile(file);
  },

  async changeName(originalName: string, newName: string){
    const file = fileAccessor.loadFile(ROUTINE_PATH(originalName));
    if(!file) throw new Error('Routine file not found.');
    await fileAccessor.renameFileWithLinks(file, ROUTINE_PATH(newName));
  },
  
  async update(routine: Routine){
    const file = fileAccessor.loadFile(ROUTINE_PATH(routine.name));
    if(!file) throw new Error('Routine file not found.');
    // 사용자가 작성한 본문을 보존하기 위해서 frontmatter만 수정한다.
    await fileAccessor.writeFrontMatter(file, () => routine.properties);
    return routine;
  },

  async updateAll(routines: Routine[]){
    const promises = routines.map(routine => routineRepository.update(routine));
    return await Promise.all(promises);
  }
}