import { routineGroupRepository } from "@/entities/repository/group-repository";
import { routineRepository } from "@/entities/repository/routine-repository";
import { NoteRoutine, NoteRoutineGroup, NoteRoutineLike, isNoteRoutineGroup } from "@/entities/types/note-routine-like";
import { Routine } from "@/entities/types/routine";
import { RoutineGroup, UNGROUPED_GROUP_NAME } from "@/entities/types/routine-group";
import { RoutineTree } from "@/entities/types/routine-tree";
import { Day } from "@/shared/period/day";
import invariant from "tiny-invariant";
import { isRoutineDueTo } from './is-routine-due-to';

const deriveNoteRoutine = (routine: Routine): NoteRoutine => ({
  name: routine.name,
  routineLikeType: "routine",
  state: "unchecked"
})

const deriveNoteRoutineGroup = (group: RoutineGroup): NoteRoutineGroup => ({
  name: group.name,
  routineLikeType: "routine-group",
  routines: [],
  isOpen: true
})

/**
 * day에 해당하는 Routine Tree를 구성한다.
 */
export class RoutineTreeBuilder {
  private rouitneMap: Map<string, Routine>;
  private groupMap: Map<string, RoutineGroup>;

  private constructor(routines: Routine[], groups: RoutineGroup[]) {
    this.rouitneMap = new Map(routines.map(r => [r.name, r]));
    this.groupMap = new Map(groups.map(g => [g.name, g]));
  }

  static with(routines: Routine[], groups: RoutineGroup[]): RoutineTreeBuilder {
    return new RoutineTreeBuilder(routines, groups);
  }

  static async withRepositoriesAsync(): Promise<RoutineTreeBuilder> {
    return new RoutineTreeBuilder(
      await routineRepository.loadAll(),
      await routineGroupRepository.loadAll()
    );
  }

  build(day: Day): RoutineTree {
    const routineMap = new Map<string, NoteRoutine | NoteRoutineGroup>();

    // 일단 모든 RoutineGroup을 map에 추가한다.
    for (const group of this.groupMap.values()) {
      const derivedGroup = deriveNoteRoutineGroup(group);
      routineMap.set(group.name, derivedGroup);
    }

    // day에 따라서 적절한 routine들을 선택하고, routineMap에 추가한다.
    for (const routine of this.rouitneMap.values()) {
      if (!isRoutineDueTo(routine, day)) continue;
      const derivedRoutine = deriveNoteRoutine(routine);
      const groupName = routine.properties.group;
      // routine에 group이 없음
      if (groupName === UNGROUPED_GROUP_NAME) {
        routineMap.set(routine.name, derivedRoutine);
      }
      // routine에 group이 있음
      else {
        const group = routineMap.get(groupName) as NoteRoutineGroup | undefined;
        invariant(group, `RoutineGroup ${groupName} not found.`);
        group.routines.push(derivedRoutine);
      }
    }

    // map 전체 value를 정렬하여 트리를 구성
    const root: NoteRoutineLike[] = [];
    for (const [_, value] of routineMap.entries()) {
      if (isNoteRoutineGroup(value)) {
        value.routines.sort((a, b) => {
          const aRoutine = this.rouitneMap.get(a.name);
          const bRoutine = this.rouitneMap.get(b.name);
          invariant(aRoutine && bRoutine, `Routine ${a.name} or ${b.name} not found.`);
          return aRoutine.properties.order - bRoutine.properties.order;
        });
      }
      root.push(value);
    }
    root.sort((a, b) => {
      const aObject = isNoteRoutineGroup(a) ? this.groupMap.get(a.name) : this.rouitneMap.get(a.name);
      const bObject = isNoteRoutineGroup(b) ? this.groupMap.get(b.name) : this.rouitneMap.get(b.name);
      invariant(aObject && bObject, `Routine or RoutineGroup ${a.name} or ${b.name} not found.`);
      return aObject.properties.order - bObject.properties.order;
    });

    return {
      root
    }
  }
}