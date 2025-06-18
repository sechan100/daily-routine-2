import { routineGroupRepository } from "@/entities/repository/group-repository";
import { routineRepository } from "@/entities/repository/routine-repository";
import { NoteRoutine, NoteRoutineGroup, NoteRoutineLike, isNoteRoutineGroup } from "@/entities/types/note-routine-like";
import { Routine } from "@/entities/types/routine";
import { RoutineGroup, UNGROUPED_GROUP_NAME } from "@/entities/types/routine-group";
import { RoutineTree } from "@/entities/types/routine-tree";
import { Day } from "@/shared/period/day";
import invariant from "tiny-invariant";
import { isRoutineDueTo } from "./is-routine-due-to";

const deriveNoteRoutine = (routine: Routine): NoteRoutine => ({
  name: routine.name,
  routineLikeType: "routine",
  state: "unchecked"
})

const deriveNoteRoutineGroup = (group: RoutineGroup): NoteRoutineGroup => ({
  name: group.name,
  routineLikeType: "routine-group",
  children: [],
  isOpen: true
})

/**
 * day에 해당하는 Routine Tree를 구성한다.
 */
export class RoutineTreeBuilder {
  private rouitneMap: Map<string, Routine>;
  private groupMap: Map<string, RoutineGroup>;
  private routines: Routine[];

  private constructor(routines: Routine[], groups: RoutineGroup[]) {
    this.routines = routines;
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

  getRoutines(): Routine[] {
    return [...this.routines];
  }

  build(day: Day): RoutineTree {
    const routines: Routine[] = [];
    // day에 따라서 적절한 routine들을 선택하고, routines 배열에 추가한다.
    for (const routine of this.rouitneMap.values()) {
      if (isRoutineDueTo(routine, day)) {
        routines.push(routine);
      }
    }
    return this.buildWithRoutines(routines);
  }

  buildWithRoutines(routines: Routine[], containAllGroups = false): RoutineTree {
    const routineMap = new Map<string, NoteRoutine | NoteRoutineGroup>();

    if (containAllGroups) {
      for (const group of this.groupMap.values()) {
        const derivedGroup = deriveNoteRoutineGroup(group);
        routineMap.set(group.name, derivedGroup);
      }
    }

    // routines를 기반으로 NoteRoutine을 만들고, 이들이 속한 RoutineGroup도 찾아서 routineMap에 추가한다.
    for (const routine of routines) {
      const derivedRoutine = deriveNoteRoutine(routine);
      const groupName = routine.properties.group;
      // routine에 group이 없음
      if (groupName === UNGROUPED_GROUP_NAME) {
        routineMap.set(routine.name, derivedRoutine);
      }
      // routine에 group이 있음
      else {
        let group = routineMap.get(groupName) as NoteRoutineGroup | undefined;
        if (!group) {
          const routineGroup = this.groupMap.get(groupName);
          invariant(routineGroup, `RoutineGroup ${groupName} not found.`);
          const derivedGroup = deriveNoteRoutineGroup(routineGroup);
          routineMap.set(groupName, derivedGroup);
          group = derivedGroup;
        }
        group.children.push(derivedRoutine);
      }
    }

    // map 전체 value를 정렬하여 트리를 구성
    const root: NoteRoutineLike[] = [];
    for (const [_, value] of routineMap.entries()) {
      if (isNoteRoutineGroup(value)) {
        value.children.sort((a, b) => {
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