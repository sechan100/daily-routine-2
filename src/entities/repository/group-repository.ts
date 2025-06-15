import { ensureFolder } from "@/shared/file/ensure-folder";
import { fileAccessor } from "@/shared/file/file-accessor";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { TFile } from "obsidian";
import { deserializeRoutineGroup, serializeRoutineGroup } from "../serializer/routine-group";
import { RoutineGroup, RoutineGroupProperties } from "../types/routine-group";


export type CreateRoutineGroupForm = {
  name: string;
  properties: RoutineGroupProperties;
}

const getGroupPath = (groupName: string) => {
  return `${useSettingsStores.getState().routineGroupFolderPath}/${groupName}.md`;
}

class RoutineGroupRepository {
  private groupCache: Map<string, RoutineGroup>;

  constructor() {
    this.groupCache = new Map<string, RoutineGroup>();
  }

  async loadAll(): Promise<RoutineGroup[]> {
    if (!this.isCacheExist()) {
      const groupFolder = (await ensureFolder(useSettingsStores.getState().routineGroupFolderPath));
      for (const file of groupFolder.children) {
        if (file instanceof TFile && file.extension === 'md') {
          const group = await this.readGroupFile(file);
          this.groupCache.set(group.name, group);
        }
      }
    }
    return Array.from(this.groupCache.values()).map(group => structuredClone(group));
  }

  async load(groupName: string): Promise<RoutineGroup> {
    const cached = this.groupCache.get(groupName);
    if (cached) {
      return structuredClone(cached);
    }
    const file = this.ensureGroupFile(groupName);
    return this.readGroupFile(file);
  }

  isExist(groupName: string): boolean {
    if (this.groupCache.has(groupName)) {
      return true;
    }
    const path = getGroupPath(groupName);
    return fileAccessor.loadFile(path) !== null;
  }

  /**
   * 새로운 RoutineGroup을 생성하고 저장합니다.
   */
  async persist(group: RoutineGroup): Promise<RoutineGroup> {
    if (this.isExist(group.name)) {
      throw new Error(`Group with name '${group.name}' already exists.`);
    }
    const path = getGroupPath(group.name);
    const fileContent = serializeRoutineGroup(group);
    await fileAccessor.createFile(path, fileContent);
    if (this.isCacheExist()) {
      await this.updateCache(group);
    }
    return group;
  }

  /**
   * RoutineGroup을 삭제합니다.
   * 캐시를 업데이트합니다.
   */
  async delete(groupName: string): Promise<void> {
    const file = this.ensureGroupFile(groupName);
    await fileAccessor.deleteFile(file);
    if (this.isCacheExist()) {
      this.groupCache.delete(groupName);
    }
  }

  /**
   * RoutineGroup의 이름을 변경합니다.
   * 캐시를 업데이트합니다.
   */
  async rename(originalName: string, newName: string): Promise<void> {
    const file = this.ensureGroupFile(originalName);
    await fileAccessor.renameFileWithLinks(file, getGroupPath(newName));
    if (this.isCacheExist()) {
      this.groupCache.delete(originalName);
      await this.updateCache(newName);
    }
  }

  /**
   * RoutineGroup의 속성을 업데이트합니다.
   * 파일을 수정하고 캐시를 업데이트합니다.
   */
  async updateProperties(groupName: string, properties: RoutineGroupProperties): Promise<void> {
    const file = this.ensureGroupFile(groupName);
    await fileAccessor.writeFile(file, (content) => {
      const group = deserializeRoutineGroup(file, content);
      group.properties = properties;
      return serializeRoutineGroup(group);
    });
    if (this.isCacheExist()) {
      await this.updateCache(groupName);
    }
  }

  ////////////////////////////////////////////////////
  // Private Methods
  ////////////////////////////////////////////////////
  private ensureGroupFile(groupName: string): TFile {
    const path = getGroupPath(groupName);
    const file = fileAccessor.loadFile(path);
    if (!file) {
      throw new Error(`Group file '${groupName}' not found.`);
    }
    return file;
  }

  private async readGroupFile(file: TFile): Promise<RoutineGroup> {
    const fileContent = await fileAccessor.readFileFromDisk(file);
    return deserializeRoutineGroup(file, fileContent);
  }

  private isCacheExist(): boolean {
    return this.groupCache.size > 0;
  }

  private async updateCache(groupOrName: string | RoutineGroup): Promise<void> {
    let group: RoutineGroup;
    if (typeof groupOrName === 'string') {
      const path = getGroupPath(groupOrName);
      const file = fileAccessor.loadFile(path);
      if (!file) throw new Error(`Group file '${groupOrName}' not found.`);
      group = await this.readGroupFile(file);
    } else {
      group = structuredClone(groupOrName);
    }
    this.groupCache.set(group.name, group);
  }
}

export const routineGroupRepository = new RoutineGroupRepository();