import { RoutineNote, NoteElement, TaskEntity } from "@entities/note";
import { isRoutine, Routine, RoutineEntity, RoutineGroup, RoutineGroupEntity } from "@entities/routine";
import { GroupLoadFailure, groupRepository } from "@entities/routine/repository/group-repository";
import { RoutineLoadFailure, routineRepository } from "@entities/routine/repository/routine-repository";
import { Day } from "@shared/period/day";
import { err, ok, Result } from "neverthrow";



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

  // 읽지 못한 루틴·그룹 파일은 건너뛴다. 아직 없는 노트를 새로 만들 때 쓴다.
  static async withLoadFromRepositoryAsync(): Promise<RoutineNoteCreator> {
    return new RoutineNoteCreator(
      await routineRepository.loadAll(),
      await groupRepository.loadAll()
    );
  }

  /**
   * 루틴·그룹 파일을 하나라도 읽지 못하면 실패한다.
   * 이미 있는 노트를 다시 만드는 병합이 일부만 읽은 목록을 쓰면, 읽지 못한 그룹과 루틴이 노트에서 지워지고 파일을 고친 뒤에도 돌아오지 않기 때문이다.
   */
  static async loadStrictAsync(): Promise<Result<RoutineNoteCreator, (RoutineLoadFailure | GroupLoadFailure)[]>> {
    const routines = await routineRepository.loadAllSettled();
    const groups = await groupRepository.loadAllSettled();
    const failures = [...routines.failures, ...groups.failures];
    if(failures.length > 0) return err(failures);
    return ok(new RoutineNoteCreator(routines.items, groups.items));
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
        };
      }
    });
    
    return {
      day,
      children: root
    }
  }
}