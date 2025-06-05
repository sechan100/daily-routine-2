/* eslint-disable @typescript-eslint/no-explicit-any */
import { Day } from "@/shared/period/day";
import invariant from "tiny-invariant";
import { Routine, RoutineGroup, routineGroupService, routineService, UNGROUPED_GROUP_NAME } from "../../routine-like";
import { isNoteRoutineGroup, NoteRoutine, NoteRoutineGroup, NoteRoutineLike } from "../model/note-routine-like";
import { RoutineTree } from "../model/routine-tree";

const deriveNoteRoutine = (routine: Routine): NoteRoutine => ({
  name: routine.name,
  routineLikeType: "routine",
  state: "un-checked"
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
export class RoutineBuilder {
  private rouitneMap: Map<string, Routine>;
  private groupMap: Map<string, RoutineGroup>;

  private constructor(routines: Routine[], groups: RoutineGroup[]) {
    this.rouitneMap = new Map(routines.map(r => [r.name, r]));
    this.groupMap = new Map(groups.map(g => [g.name, g]));
  }

  static with(routines: Routine[], groups: RoutineGroup[]): RoutineBuilder {
    return new RoutineBuilder(routines, groups);
  }

  static async withDiskAsync(): Promise<RoutineBuilder> {
    return new RoutineBuilder(
      await routineService.loadAll(),
      await routineGroupService.loadAll()
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
      if (!routineService.isDueTo(routine, day)) continue;

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
      day,
      root
    }
  }
}