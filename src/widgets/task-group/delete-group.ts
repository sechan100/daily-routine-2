import { noteRepository, RoutineNote, TaskGroupEntity } from "@entities/note";
import { groupRepository, RoutineGroupEntity, routineRepository } from "@entities/routine";


export const deleteGroup = async (note: RoutineNote, groupName: string, deleteSubTasks: boolean): Promise<RoutineNote> => {
  // routineGroup 삭제
  await groupRepository.delete(groupName);

  // 하위 routine 삭제 또는 ungroup 처리
  const routines = await routineRepository.loadAll();
  if(deleteSubTasks){
    const deleteTargets = routines.filter(routine => routine.properties.group === groupName);
    for(const target of deleteTargets){
      await routineRepository.delete(target.name);
    }
  } else {
    const ungroupTarget = routines.filter(routine => routine.properties.group === groupName);
    for(const target of ungroupTarget){
      target.properties.group = RoutineGroupEntity.UNGROUPED_NAME;
    }
    await routineRepository.updateAll(ungroupTarget);
  }
  // note에서 그룹 삭제
  const newNote = TaskGroupEntity.deleteTaskGroup(note, groupName, deleteSubTasks);
  return newNote;
}