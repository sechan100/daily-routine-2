import { fileAccessor } from "@/shared/file/file-accessor";
import { RoutineRepository } from "../routine/routine-repository";
import { RoutineGroup } from "../routine/routine-type";
import { GROUP_PATH } from "../utils";
import { GroupRepository } from "./group-repository";
import { RoutineGroupEntity } from "./routine-group";


export const GroupService = {

  async loadAll() {
    return await GroupRepository.loadAll();
  },

  async load(groupName: string) {
    return await GroupRepository.load(groupName);
  },

  isExist(groupName: string) {
    return GroupRepository.isExist(groupName);
  },

  async persist(group: RoutineGroup) {
    return await GroupRepository.persist(group);
  },

  /**
   * RoutineGroup을 삭제한다.
   * @param groupName 
   * @param deleteSubTasks 해당 flag가 true일 경우, 해당 그룹에 속한 모든 Routine을 같이 삭제한다. false라면 Routine들을 Ungroup 처리한다.
   * @returns 
   */
  async delete(groupName: string, deleteSubTasks: boolean) {
    // Group 파일 삭제
    await GroupRepository.delete(groupName);

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
    return await GroupRepository.update(group);
  },

  async changeName(originalName: string, newName: string) {
    // Group 이름 변경
    await GroupRepository.changeName(originalName, newName);

    // Group과 연결된 모든 Routine의 group 속성 변경
    const routinesInThisGroup = (await RoutineRepository.loadAll()).filter(routine => routine.properties.group === originalName);
    const groupNameChangedRoutines = routinesInThisGroup.map(routine => ({
      ...routine,
      properties: {
        ...routine.properties,
        group: newName
      }
    }));
    await Promise.all(groupNameChangedRoutines.map(r => RoutineRepository.update(r)));
  },
}