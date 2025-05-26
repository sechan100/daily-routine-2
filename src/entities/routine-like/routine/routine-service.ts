import { RoutineRepository } from "./routine-repository";
import { Routine } from "./routine-type";

const allRoutinesCache: Routine[] = [];
const routineCache: Map<string, Routine> = new Map<string, Routine>();


export const RoutineService = {

  async loadAll() {
    if (allRoutinesCache.length > 0) {
      return [...allRoutinesCache]; // 캐시 복사본
    }

    const routines = await RoutineRepository.loadAll();
    allRoutinesCache.push(...routines);

    // 개별 캐시도 업데이트
    routines.forEach(routine => {
      routineCache.set(routine.name, { ...routine });
    });

    return [...routines];
  },

  async load(routineName: string) {
    // 개별 캐시에서 먼저 확인
    if (routineCache.has(routineName)) {
      return { ...routineCache.get(routineName) }; // 객체 복사본 반환
    }

    const routine = await RoutineRepository.load(routineName);
    if (routine) {
      routineCache.set(routineName, { ...routine });
    }

    return routine;
  },

  async create(routine: Routine) {
    const result = await RoutineRepository.create(routine);

    // 전체 캐시 무효화
    allRoutinesCache.splice(0);

    // 개별 캐시에 새 루틴 추가
    routineCache.set(routine.name, { ...routine });

    return result;
  },

  async delete(routineName: string) {
    await RoutineRepository.delete(routineName);

    // 전체 캐시 무효화
    allRoutinesCache.splice(0);

    // 개별 캐시에서 제거
    routineCache.delete(routineName);
  },

  async changeName(originalName: string, newName: string) {
    await RoutineRepository.changeName(originalName, newName);

    // 전체 캐시 무효화 (이름이 변경되면 전체 목록 영향)
    allRoutinesCache.splice(0);

    // 개별 캐시 업데이트
    const cachedRoutine = routineCache.get(originalName);
    if (cachedRoutine) {
      routineCache.delete(originalName);
      routineCache.set(newName, { ...cachedRoutine, name: newName });
    }
  },

  async update(routine: Routine): Promise<Routine> {
    const result = await RoutineRepository.update(routine);

    // 개별 캐시 업데이트
    routineCache.set(routine.name, { ...result });

    // 전체 캐시가 있다면 해당 항목 업데이트
    if (allRoutinesCache.length > 0) {
      const index = allRoutinesCache.findIndex(r => r.name === routine.name);
      if (index !== -1) {
        allRoutinesCache[index] = { ...result };
      }
    }

    return result;
  }
}