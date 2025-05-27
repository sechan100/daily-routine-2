/* eslint-disable @typescript-eslint/no-explicit-any */
import { Day } from "@/shared/period/day";
import { validateObsidianFileTitle } from "@/shared/utils/validate-obsidian-file-title";
import { Result, err, ok } from "neverthrow";
import { Routine } from "../model/routine";
import { routineRepository } from "../repository/routine-repository";

type NameValidationArgs = {
  name: string;
  existingNames: string[];
}

const allRoutinesCache: Routine[] = [];
const routineCache: Map<string, Routine> = new Map<string, Routine>();


interface RoutineService {
  validateName: (args: NameValidationArgs) => Result<string, string>;
  isDueTo: (routine: Routine, day: Day) => boolean;
  loadAll: () => Promise<Routine[]>;
  load: (routineName: string) => Promise<Routine>;
  create: (routine: Routine) => Promise<Routine>;
  delete: (routineName: string) => Promise<void>;
  changeName: (originalName: string, newName: string) => Promise<void>;
  update: (routine: Routine) => Promise<Routine>;
}
export const routineService: RoutineService = {
  validateName: ({
    name: name0,
    existingNames
  }: NameValidationArgs): Result<string, string> => {
    return validateObsidianFileTitle(name0)
      .andThen(name1 => {
        return existingNames.includes(name1) ? err('duplicated') : ok(name1);
      });
  },

  /**
   * routine의 여러 properties들을 분석하여, day에 루틴을 수행해야하는지의 여부를 반환한다.
   */
  isDueTo(routine: Routine, day: Day): boolean {
    const p = routine.properties;
    if (!p.enabled) return false;
    if (p.recurrenceUnit === "month") {
      const days = Array.from(p.daysOfMonth);
      // 0이 존재하는 경우, 0을 매개받은 day의 달의 마지막 날짜로 치환한다.
      if (days.contains(0)) {
        const lastDayOfMonth = day.daysInMonth();
        days.remove(0);
        days.push(lastDayOfMonth);
      }
      if (!days.contains(day.date)) return false;
    }
    else if (p.recurrenceUnit === "week") {
      if (!p.daysOfWeek.contains(day.dow)) return false;
    }
    else {
      throw new Error('Invalid recurrenceUnit');
    }
    return true;
  },

  async loadAll() {
    if (allRoutinesCache.length > 0) {
      return [...allRoutinesCache]; // 캐시 복사본
    }

    const routines = await routineRepository.loadAll();
    allRoutinesCache.push(...routines);

    // 개별 캐시도 업데이트
    routines.forEach(routine => {
      routineCache.set(routine.name, { ...routine });
    });

    return [...routines];
  },

  async load(routineName: string) {
    // 개별 캐시에서 먼저 확인
    const cacheRoutine = routineCache.get(routineName);
    if (cacheRoutine !== undefined) {
      return { ...cacheRoutine };
    }

    const routine = await routineRepository.load(routineName);
    if (routine) {
      routineCache.set(routineName, { ...routine });
    }

    return routine;
  },

  async create(routine: Routine) {
    const result = await routineRepository.persist(routine);

    // 전체 캐시 무효화
    allRoutinesCache.splice(0);

    // 개별 캐시에 새 루틴 추가
    routineCache.set(routine.name, { ...routine });

    return routine;
  },

  async delete(routineName: string) {
    await routineRepository.delete(routineName);

    // 전체 캐시 무효화
    allRoutinesCache.splice(0);

    // 개별 캐시에서 제거
    routineCache.delete(routineName);
  },

  async changeName(originalName: string, newName: string) {
    await routineRepository.changeName(originalName, newName);

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
    const result = await routineRepository.update(routine);

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

