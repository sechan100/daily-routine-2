import { groupRepository, RoutineGroupEntity, routineRepository } from "@entities/routine";
import { removeGroupInNotes, runExclusiveWithMerges } from "@features/merge-note";


/**
 * 그룹 파일을 지우고, 하위 routine을 삭제하거나 ungroup한 뒤, 오늘과 미래 노트에서도 그룹을 정리한다.
 * 중간에 병합이 끼어들면 일부만 바뀐 루틴 목록으로 노트를 다시 만들 수 있으므로 병합 큐 안에서 한 번에 처리한다.
 */
export const deleteGroup = (groupName: string, deleteSubTasks: boolean): Promise<void> => runExclusiveWithMerges(async () => {
  await groupRepository.delete(groupName);

  const routines = (await routineRepository.loadAll()).filter(routine => routine.properties.group === groupName);
  if(deleteSubTasks){
    for(const target of routines){
      await routineRepository.delete(target.name);
    }
  } else {
    await routineRepository.updateAll(routines.map(routine => ({
      ...routine,
      properties: { ...routine.properties, group: RoutineGroupEntity.UNGROUPED_NAME },
    })));
  }

  await removeGroupInNotes(groupName, deleteSubTasks);
});
