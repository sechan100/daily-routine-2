/* eslint-disable @typescript-eslint/no-explicit-any */
import { NoteElement, RoutineNote, TaskEntity, TaskGroup } from "@/entities/note";
import { GroupRepository, isRoutine, Routine, RoutineEntity, RoutineGroup, RoutineGroupEntity, RoutineRepository } from "@/entities/routine-like";
import { Day } from "@/shared/period/day";



export class RoutineNoteCreator {
  private rouitnes: Routine[];
  private groups: RoutineGroup[];

  private constructor(routines: Routine[], groups: RoutineGroup[]) {
    this.rouitnes = routines;
    this.groups = groups;
  }

  static with(routines: Routine[], groups: RoutineGroup[]): RoutineNoteCreator {
    return new RoutineNoteCreator(routines, groups);
  }

  static async withLoadFromRepositoryAsync(): Promise<RoutineNoteCreator> {
    return new RoutineNoteCreator(
      await RoutineRepository.loadAll(),
      await GroupRepository.loadAll()
    );
  }

  create(day: Day): RoutineNote {
    const r_root: (Routine | RoutineGroup)[] = [...this.groups];
    const routineMap = new Map<string, Routine[]>(this.groups.map(g => [g.name, []]));

    // routine을 Group, 또는 UNGROUPED에 맞게 배치
    for (const routine of this.rouitnes) {
      if (!RoutineEntity.isDueTo(routine, day)) continue;

      const groupName = routine.properties.group;
      if (groupName === RoutineGroupEntity.UNGROUPED_NAME) {
        r_root.push(routine);
        continue;
      }
      const routines = routineMap.get(groupName);
      if (!routines) throw new Error(`${routine.name}'s Group '${groupName}' not found.`);
      routines.push(routine);
    }
    // routine과 routineGroup으로 이루어진 임시 root를 정렬
    r_root.sort((a, b) => a.properties.order - b.properties.order);

    const root: NoteElement[] = r_root.map(el => {
      if (isRoutine(el)) {
        return TaskEntity.createRoutineTask(el);
      } else {
        const routines = routineMap.get(el.name);
        if (!routines) throw new Error(`RoutineGroup ${el.name} not found.`);

        routines.sort((a, b) => a.properties.order - b.properties.order);
        const tasks = routines.map(routine => TaskEntity.createRoutineTask(routine));
        return {
          elementType: "group",
          name: el.name,
          children: tasks,
          isOpen: true
        } as TaskGroup;
      }
    });

    return {
      day,
      children: root
    }
  }
}