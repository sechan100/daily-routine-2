import { ensureFolder } from "@/shared/file/ensure-folder";
import { fileAccessor } from "@/shared/file/file-accessor";
import { SETTINGS } from "@/shared/settings";
import { TFile } from "obsidian";
import { routineGroupInitialContent } from "../config/initial-content";
import { RoutineGroup } from "../model/routine-group";
import { deserializeRoutineGroup, serializeRoutineGroup } from "../serialize/group";


const getGroupPath = (groupName: string) => {
  return `${SETTINGS.getRoutineGroupFolderPath()}/${groupName}.md`;
}


interface RoutineGroupRepository {
  loadAll(): Promise<RoutineGroup[]>;
  load(groupName: string): Promise<RoutineGroup>;
  isExist(groupName: string): boolean;
  persist(group: RoutineGroup): Promise<RoutineGroup>;
  delete(groupName: string): Promise<void>;
  update(group: RoutineGroup): Promise<RoutineGroup>;
  changeName(originalName: string, newName: string): Promise<void>;
}
export const routineGroupRepository: RoutineGroupRepository = {

  async loadAll() {
    const groupFiles = (await ensureFolder(SETTINGS.getRoutineGroupFolderPath())).children
      .filter(file => file instanceof TFile);
    return Promise.all(groupFiles.map(deserializeRoutineGroup));
  },

  async load(groupName: string) {
    const file = fileAccessor.loadFile(getGroupPath(groupName));
    if (!file) throw new Error('Group file not found.');
    return await deserializeRoutineGroup(file);
  },

  isExist(groupName: string) {
    return fileAccessor.loadFile(getGroupPath(groupName)) !== null;
  },

  async persist(group: RoutineGroup) {
    const path = getGroupPath(group.name);
    const file = fileAccessor.loadFile(path);
    if (file !== null) {
      await fileAccessor.createFile(path, serializeRoutineGroup(routineGroupInitialContent, group));
      return group;
    } else {
      throw new Error(`Group with name '${group.name}' already exists.`);
    }
  },

  /**
   * RoutineGroup을 삭제한다.
   */
  async delete(groupName: string) {
    // Group 파일 삭제
    const file = fileAccessor.loadFile(getGroupPath(groupName));
    if (!file) return;
    await fileAccessor.deleteFile(file);
  },

  async update(group: RoutineGroup) {
    const file = fileAccessor.loadFile(getGroupPath(group.name));
    if (!file) throw new Error('Group file not found.');
    await fileAccessor.writeFile(file, (content) => serializeRoutineGroup(content, group));
    return group;
  },

  async changeName(originalName: string, newName: string) {
    // Group 이름 변경
    const file = fileAccessor.loadFile(getGroupPath(originalName));
    if (!file) throw new Error('Group file not found.');
    await fileAccessor.renameFileWithLinks(file, getGroupPath(newName));
  },
}