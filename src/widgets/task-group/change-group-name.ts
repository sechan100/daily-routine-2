import { groupRepository, Routine, routineRepository } from "@entities/routine";



const loadRoutinesIn = async (groupName: string): Promise<Routine[]> => {
  const routines = await routineRepository.loadAll();
  return routines.filter(routine => routine.properties.group === groupName);
}



export const changeGroupName = async (oldName: string, newName: string) => {
  const routines = (await loadRoutinesIn(oldName)).map(r => ({
    ...r,
    properties: {
      ...r.properties,
      group: newName
    }
  }));

  await groupRepository.changeName(oldName, newName);
  await routineRepository.updateAll(routines);
}

