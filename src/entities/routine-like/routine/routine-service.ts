import { RoutineRepository } from "./routine-repository";
import { Routine } from "./routine-type";



export const RoutineService = {

  async loadAll() {
    return await RoutineRepository.loadAll();
  },

  async load(routineName: string) {
    return await RoutineRepository.load(routineName);
  },

  async create(routine: Routine) {
    return await RoutineRepository.create(routine);
  },

  async delete(routineName: string) {
    await RoutineRepository.delete(routineName);
  },

  async changeName(originalName: string, newName: string) {
    await RoutineRepository.changeName(originalName, newName);
  },

  async update(routine: Routine): Promise<Routine> {
    return await RoutineRepository.update(routine);
  }
}