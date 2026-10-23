import { groupRepository, Routine, routineRepository } from "@entities/routine";
import { renameGroupInNotes, runExclusiveWithMerges } from "@features/merge-note";



const loadRoutinesIn = async (groupName: string): Promise<Routine[]> => {
  const routines = await routineRepository.loadAll();
  return routines.filter(routine => routine.properties.group === groupName);
}



export const changeGroupName = async (oldName: string, newName: string) => {
  // 병합이 바뀐 그룹 파일과 바뀌지 않은 노트를 함께 읽지 않도록, 병합 큐에서 한 번에 바꾼다.
  await runExclusiveWithMerges(async () => {
    const routines = (await loadRoutinesIn(oldName)).map(r => ({
      ...r,
      properties: {
        ...r.properties,
        group: newName
      }
    }));

    await groupRepository.changeName(oldName, newName);
    await routineRepository.updateAll(routines);
    // 노트 안의 그룹 이름도 바꿔야 다음 병합에서 그룹 안의 todo가 그룹을 잃고 노트 맨 앞으로 밀려나지 않는다.
    await renameGroupInNotes(oldName, newName);
  });
}
