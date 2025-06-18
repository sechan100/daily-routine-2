import { routineGroupRepository } from "@/entities/repository/group-repository";
import { routineRepository } from "@/entities/repository/routine-repository";
import { UNGROUPED_GROUP_NAME } from "@/entities/types/routine-group";


/**
 * RoutineGroup을 삭제한다.
 * @param groupName 
 * @param deleteSubTasks true라면 해당 그룹에 속한 모든 Routine을 같이 삭제하고, false라면 속한 Routine들의 group을 'UNGROUPED'로 변경한다.
 * @returns 
 */
export const deleteRoutineGroup = async (groupName: string, deleteSubTasks: boolean): Promise<void> => {
  // Group 삭제
  await routineGroupRepository.delete(groupName);

  // 하위 routine 삭제, 또는 ungroup 처리
  const routinesInThisGroup = (await routineRepository.loadAll()).filter(routine => routine.properties.group === groupName);
  if (deleteSubTasks) {
    for (const routine of routinesInThisGroup) {
      await routineRepository.delete(routine.name);
    }
  }
  else {
    for (const routine of routinesInThisGroup) {
      routine.properties.group = UNGROUPED_GROUP_NAME;
      await routineRepository.updateProperties(routine.name, routine.properties);
    }
  }
}