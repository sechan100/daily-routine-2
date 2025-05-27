/* eslint-disable @typescript-eslint/no-explicit-any */
import { validateObsidianFileTitle } from "@/shared/utils/validate-obsidian-file-title";
import { err, ok, Result } from "neverthrow";
import { RoutineGroup, UNGROUPED_GROUP_NAME } from "../model/routine-group";
import { routineGroupRepository } from "../repository/group-repository";
import { routineService } from "./routine";


const allGroupsCache: RoutineGroup[] = [];
const groupCache: Map<string, RoutineGroup> = new Map<string, RoutineGroup>();

interface RoutineGroupService {
  validateName(name0: string, groupNames: string[]): Result<string, string>;
  loadAll(): Promise<RoutineGroup[]>;
  load(groupName: string): Promise<RoutineGroup | undefined>;
  isExist(groupName: string): boolean;
  persist(group: RoutineGroup): Promise<RoutineGroup>;
  delete(groupName: string, deleteSubTasks: boolean): Promise<void>;
  update(group: RoutineGroup): Promise<RoutineGroup>;
  changeName(originalName: string, newName: string): Promise<void>;
}
export const routineGroupService: RoutineGroupService = {
  validateName(name0: string, groupNames: string[]): Result<string, string> {
    return validateObsidianFileTitle(name0)
      .andThen(name1 => {
        const invalidNames = [UNGROUPED_GROUP_NAME];
        return invalidNames.includes(name1) ? err('invalid-name') : ok(name1);
      })
      .andThen(name2 => {
        return groupNames.includes(name2) ? err('duplicated') : ok(name2);
      });
  },

  async loadAll() {
    if (allGroupsCache.length > 0) {
      return [...allGroupsCache]; // 배열 복사본 반환
    }

    const groups = await routineGroupRepository.loadAll();
    allGroupsCache.push(...groups);

    // 개별 캐시도 업데이트
    groups.forEach(group => {
      groupCache.set(group.name, { ...group });
    });

    return [...groups];
  },

  async load(groupName: string) {
    const cachedGroup = groupCache.get(groupName);
    if (cachedGroup) {
      return { ...cachedGroup };
    }

    const group = await routineGroupRepository.load(groupName);
    if (group) {
      groupCache.set(groupName, { ...group });
    }

    return group;
  },

  isExist(groupName: string) {
    // 캐시에서 먼저 확인
    if (groupCache.has(groupName)) {
      return true;
    }

    // 전체 캐시가 로드되어 있다면 거기서 확인
    if (allGroupsCache.length > 0) {
      return allGroupsCache.some(group => group.name === groupName);
    }

    // 캐시에 없으면 Repository에서 확인
    return routineGroupRepository.isExist(groupName);
  },

  async persist(group: RoutineGroup) {
    const result = await routineGroupRepository.persist(group);

    // 전체 캐시 무효화 (새 그룹 추가)
    allGroupsCache.splice(0);

    // 개별 캐시에 새 그룹 추가
    groupCache.set(group.name, { ...group });

    return result;
  },

  /**
   * RoutineGroup을 삭제한다.
   * @param groupName 
   * @param deleteSubTasks 해당 flag가 true일 경우, 해당 그룹에 속한 모든 Routine을 같이 삭제한다. false라면 Routine들을 Ungroup 처리한다.
   * @returns 
   */
  async delete(groupName: string, deleteSubTasks: boolean) {
    // Group 파일 삭제
    await routineGroupRepository.delete(groupName);

    // 하위 routine 삭제, 또는 ungroup 처리
    const routinesInThisGroup = (await routineService.loadAll()).filter(routine => routine.properties.group === groupName);
    if (deleteSubTasks) {
      for (const routine of routinesInThisGroup) {
        await routineService.delete(routine.name);
      }
    }
    else {
      for (const routine of routinesInThisGroup) {
        routine.properties.group = UNGROUPED_GROUP_NAME;
      }
      await Promise.all(routinesInThisGroup.map(routineService.update));
    }

    // 전체 캐시 무효화
    allGroupsCache.splice(0);

    // 개별 캐시에서 제거
    groupCache.delete(groupName);
  },

  async update(group: RoutineGroup) {
    const result = await routineGroupRepository.update(group);

    // 개별 캐시 업데이트
    groupCache.set(group.name, { ...result });

    // 전체 캐시가 있다면 해당 항목 업데이트
    if (allGroupsCache.length > 0) {
      const index = allGroupsCache.findIndex(g => g.name === group.name);
      if (index !== -1) {
        allGroupsCache[index] = { ...result };
      }
    }

    return result;
  },

  async changeName(originalName: string, newName: string) {
    // Group 이름 변경
    await routineGroupRepository.changeName(originalName, newName);

    // Group과 연결된 모든 Routine의 group 속성 변경
    const routinesInThisGroup = (await routineService.loadAll()).filter(routine => routine.properties.group === originalName);
    const groupNameChangedRoutines = routinesInThisGroup.map(routine => ({
      ...routine,
      properties: {
        ...routine.properties,
        group: newName
      }
    }));
    await Promise.all(groupNameChangedRoutines.map(r => routineService.update(r)));

    // 전체 캐시 무효화 (이름이 변경되면 전체 목록 영향)
    allGroupsCache.splice(0);

    // 개별 캐시 업데이트
    const cachedGroup = groupCache.get(originalName);
    if (cachedGroup) {
      groupCache.delete(originalName);
      groupCache.set(newName, { ...cachedGroup, name: newName });
    }
  }
}