import { ensureFolder } from "@/shared/file/ensure-folder";
import { fileAccessor } from "@/shared/file/file-accessor";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { TFile } from "obsidian";
import { deserializeRoutine, serializeRoutine } from "../serializer/routine";
import { Routine, RoutineProperties } from "../types/routine";


const getRoutinePath = (routineName: string) => {
  return `${useSettingsStores.getState().routineFolderPath}/${routineName}.md`;
}

class RoutineRepository {
  private routineCache: Map<string, Routine>;

  constructor() {
    this.routineCache = new Map<string, Routine>();
  }

  async loadAll(): Promise<Routine[]> {
    if (this.routineCache.size === 0) {
      const routineFolder = await ensureFolder(useSettingsStores.getState().routineFolderPath);
      const routines: Routine[] = [];
      for (const file of routineFolder.children) {
        if (file instanceof TFile && file.extension === 'md') {
          const routine = await this.readRoutineFile(file);
          routines.push(routine);
        }
      }
      this.routineCache = new Map<string, Routine>(
        routines.map(routine => [routine.name, structuredClone(routine)])
      );
    }
    return Array.from(this.routineCache.values()).map(routine => structuredClone(routine));
  }

  async load(routineName: string): Promise<Routine> {
    const cached = this.routineCache.get(routineName);
    if (cached) {
      return structuredClone(cached);
    }
    const file = this.ensureRoutineFile(routineName);
    return this.readRoutineFile(file);
  }

  isExist(routineName: string): boolean {
    if (this.routineCache.has(routineName)) {
      return true;
    }
    const path = getRoutinePath(routineName);
    return fileAccessor.loadFile(path) !== null;
  }

  async persist(newRoutine: Routine): Promise<Routine> {
    if (this.isExist(newRoutine.name)) {
      throw new Error(`Routine with name '${newRoutine.name}' already exists.`);
    }
    const path = getRoutinePath(newRoutine.name);
    const fileContent = serializeRoutine(newRoutine);
    await fileAccessor.createFile(path, fileContent);
    if (this.isCacheExist()) {
      this.updateCacheFromRoutine(newRoutine);
    }
    return newRoutine;
  }

  async delete(routineName: string): Promise<void> {
    const file = this.ensureRoutineFile(routineName);
    await fileAccessor.deleteFile(file);
    if (this.isCacheExist()) {
      this.routineCache.delete(routineName);
    }
  }

  /**
   * Routine의 이름을 변경합니다.
   * 캐시를 업데이트합니다.
   */
  async rename(originalName: string, newName: string): Promise<void> {
    const file = this.ensureRoutineFile(originalName);
    await fileAccessor.renameFileWithLinks(file, getRoutinePath(newName));
    if (this.isCacheExist()) {
      this.routineCache.delete(originalName);
      await this.updateCacheFromFile(newName);
    }
  }

  /**
   * Routine의 속성을 업데이트합니다.
   * 파일을 수정하고 캐시를 업데이트합니다.
   */
  async updateProperties(routineName: string, properties: RoutineProperties): Promise<void> {
    const file = this.ensureRoutineFile(routineName);
    await fileAccessor.writeFile(file, (content) => {
      const routine = deserializeRoutine(file, content);
      routine.properties = properties;
      return serializeRoutine(routine);
    });
    if (this.isCacheExist()) {
      await this.updateCacheFromFile(routineName);
    }
  }

  ////////////////////////////////////////////////////
  // Private Methods
  ////////////////////////////////////////////////////
  private ensureRoutineFile(routineName: string): TFile {
    const path = getRoutinePath(routineName);
    const file = fileAccessor.loadFile(path);
    if (!file) {
      throw new Error(`Routine file '${routineName}' not found.`);
    }
    return file;
  }

  private async readRoutineFile(file: TFile): Promise<Routine> {
    const fileContent = await fileAccessor.readFileFromDisk(file);
    return deserializeRoutine(file, fileContent);
  }

  private isCacheExist(): boolean {
    return this.routineCache.size > 0;
  }

  private async updateCacheFromFile(routineName: string): Promise<void> {
    const path = getRoutinePath(routineName);
    const file = fileAccessor.loadFile(path);
    if (!file) throw new Error(`Routine file '${routineName}' not found.`);
    const routine = await this.readRoutineFile(file);
    this.routineCache.set(routine.name, routine);
  }

  private updateCacheFromRoutine(routine: Routine): void {
    this.routineCache.set(routine.name, structuredClone(routine));
  }
}

export const routineRepository = new RoutineRepository();