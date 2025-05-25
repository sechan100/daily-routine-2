import { ensureArchive } from "@/entities/archives";
import { fileAccessor } from "@/shared/file/file-accessor";
import { TFile } from "obsidian";
import { RoutineRepository } from "../routine/routine-repository";
import { RoutineGroup } from "../routine/routine-type";
import { GROUP_PATH, GROUP_PREFIX } from "../utils";
import { GroupSerializer } from "./group-serializer";
import { RoutineGroupEntity } from "./routine-group";


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
   * @param groupName 
   * @param deleteSubTasks 해당 flag가 true일 경우, 해당 그룹에 속한 모든 Routine을 같이 삭제한다. false라면 Routine들을 Ungroup 처리한다.
   * @returns 
   */
  async delete(groupName: string, deleteSubTasks: boolean) {
    // Group 파일 삭제
    const file = fileAccessor.loadFile(GROUP_PATH(groupName));
    if (!file) return;
    await fileAccessor.deleteFile(file);

    // 하위 routine 삭제, 또는 ungroup 처리
    const routinesInThisGroup = (await RoutineRepository.loadAll()).filter(routine => routine.properties.group === groupName);
    if (deleteSubTasks) {
      for (const routine of routinesInThisGroup) {
        await RoutineRepository.delete(routine.name);
      }
    }
    else {
      for (const routine of routinesInThisGroup) {
        routine.properties.group = RoutineGroupEntity.UNGROUPED_NAME;
      }
      await Promise.all(routinesInThisGroup.map(RoutineRepository.update));
    }
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

    // Group과 연결된 모든 Routine의 group 속성 변경
    const routinesInThisGroup = (await RoutineRepository.loadAll()).filter(routine => routine.properties.group === originalName);
    const groupNameChangedRoutines = routinesInThisGroup.map(routine => ({
      ...routine,
      properties: {
        ...routine.properties,
        group: newName
      }
    }));
    await Promise.all(groupNameChangedRoutines.map(RoutineRepository.update));
  },
}