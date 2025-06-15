import { routineGroupRepository } from "@/entities/repository/group-repository";
import { routineRepository } from "@/entities/repository/routine-repository";
import { Routine } from "@/entities/types/routine";


/**
 * RoutineGroup의 이름을 변경합니다.
 * 해당 그룹에 속한 Routine들의 Group 속성도 함께 변경합니다.
 * @param originalName 
 * @param newName 
 */
export const renameRoutineGroup = async (originalName: string, newName: string): Promise<void> => {
  // Group 이름 변경
  await routineGroupRepository.rename(originalName, newName);
  // Group과 연결된 모든 Routine의 group 속성 변경
  const routinesInThisGroup = (await routineRepository.loadAll()).filter(routine => routine.properties.group === originalName);
  const groupNameChangedRoutines: Routine[] = routinesInThisGroup.map(routine => ({
    ...routine,
    properties: {
      ...routine.properties,
      group: newName
    }
  }));
  for (const routine of groupNameChangedRoutines) {
    await routineRepository.updateProperties(routine.name, routine.properties);
  }
}