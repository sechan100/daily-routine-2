import { ensureArchive } from "@/entities/archives";
import { fileAccessor } from "@/shared/file/file-accessor";
import { TFile } from "obsidian";
import { RoutineGroup } from "../routine/routine-type";
import { GROUP_PATH, GROUP_PREFIX } from "../utils";
import { GroupSerializer } from "./group-serializer";


export const GroupRepository = {

  async loadAll() {
    const groupFiles = (await ensureArchive("routines")).children
      .filter(file => file instanceof TFile)
      .filter(file => file.name.startsWith(GROUP_PREFIX));
    return Promise.all(groupFiles.map(GroupSerializer.deserialize));
  },

  async load(groupName: string) {
    const file = fileAccessor.loadFile(GROUP_PATH(groupName));
    if (!file) throw new Error('Group file not found.');
    return await GroupSerializer.deserialize(file);
  },

  isExist(groupName: string) {
    return fileAccessor.loadFile(GROUP_PATH(groupName)) !== null;
  },

  async persist(group: RoutineGroup) {
    const path = GROUP_PATH(group.name);
    const file = fileAccessor.loadFile(path);
    if (file) return false;

    await fileAccessor.createFile(path, GroupSerializer.serialize(group));
    return true;
  },

  /**
   * RoutineGroup을 삭제한다.
   */
  async delete(groupName: string) {
    // Group 파일 삭제
    const file = fileAccessor.loadFile(GROUP_PATH(groupName));
    if (!file) return;
    await fileAccessor.deleteFile(file);
  },

  async update(group: RoutineGroup) {
    const file = fileAccessor.loadFile(GROUP_PATH(group.name));
    if (!file) throw new Error('Group file not found.');
    await fileAccessor.writeFile(file, () => GroupSerializer.serialize(group));
    return group;
  },

  async changeName(originalName: string, newName: string) {
    // Group 이름 변경
    const file = fileAccessor.loadFile(GROUP_PATH(originalName));
    if (!file) throw new Error('Group file not found.');
    await fileAccessor.renameFileWithLinks(file, GROUP_PATH(newName));
  },
}