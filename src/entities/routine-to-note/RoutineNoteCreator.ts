/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoutineNote, RoutineTask, TaskGroup, NoteElement, TaskGroupEntity, TaskEntity } from "@entities/note";
import { isRoutine, Routine, RoutineEntity, RoutineGroup, RoutineGroupEntity } from "@entities/routine";
import { groupRepository } from "@entities/routine/repository/group-repository";
import { routineRepository } from "@entities/routine/repository/routine-repository";
import { Day } from "@shared/period/day";



export class RoutineNoteCreator {
  private rouitnes: Routine[];
  private groups: RoutineGroup[];

  private constructor(routines: Routine[], groups: RoutineGroup[]){
    this.rouitnes = routines;
    this.groups = groups;
  }

  static with(routines: Routine[], groups: RoutineGroup[]): RoutineNoteCreator {
    return new RoutineNoteCreator(routines, groups);
  }

  static async withLoadFromRepositoryAsync(): Promise<RoutineNoteCreator> {
    return new RoutineNoteCreator(
      await routineRepository.loadAll(),
      await groupRepository.loadAll()
    );
  }

  create(day: Day): RoutineNote {
    const r_root: (Routine | RoutineGroup)[] = [...this.groups];
    const routineMap = new Map<string, Routine[]>(this.groups.map(g => [g.name, []]));

    // routine을 Group, 또는 UNGROUPED에 맞게 배치
    for(const routine of this.rouitnes){
      if(!RoutineEntity.isDueTo(routine, day)) continue;

      const groupName = routine.properties.group;
      if(groupName === RoutineGroupEntity.UNGROUPED_NAME){
        r_root.push(routine);
        continue;
      }
      const routines = routineMap.get(groupName);
      if(!routines){
        // 존재하지 않는 그룹을 참조하는 routine은 UNGROUPED로 취급한다.
        r_root.push(routine);
        continue;
      }
      routines.push(routine);
    }
    // routine과 routineGroup으로 이루어진 임시 root를 정렬
    r_root.sort((a, b) => a.properties.order - b.properties.order);

    const root: NoteElement[] = r_root.map(el => {
      if(isRoutine(el)){
        return TaskEntity.createRoutineTask(el);
      } else {
        const routines = routineMap.get(el.name) ?? [];

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