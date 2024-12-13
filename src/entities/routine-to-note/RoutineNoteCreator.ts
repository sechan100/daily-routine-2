/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoutineNote, RoutineTask, TaskGroup } from "@entities/note";
import { TaskElement } from "@entities/note/domain/TaskElement";
import { GroupRepository, Routine, RoutineGroup, RoutineRepository } from "@entities/routine";
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
      await RoutineRepository.loadAll(),
      await GroupRepository.loadAll()
    );
  }

  create(day: Day): RoutineNote {
    const r_root: (Routine | RoutineGroup)[] = [...this.groups];
    const routineMap = new Map<string, Routine[]>(this.groups.map(g => [g.getName(), []]));

    // routine을 Group, 또는 UNGROUPED에 맞게 배치
    for(const routine of this.rouitnes){
      if(!routine.isDueTo(day)) continue;

      const groupName = routine.getProperties().getGroup();
      if(groupName === RoutineGroup.UNGROUPED_NAME){
        r_root.push(routine);
        continue;
      }
      const routines = routineMap.get(groupName);
      if(!routines) throw new Error(`${routine.getName()}'s Group '${groupName}' not found.`);
      routines.push(routine);
    }
    // routine과 routineGroup으로 이루어진 임시 root를 정렬
    r_root.sort((a, b) => a.getProperties().getOrder() - b.getProperties().getOrder());

    const root: TaskElement<any>[] = r_root.map(routineOrGroup => {
      if(routineOrGroup instanceof Routine){
        return RoutineTask.fromRoutine(routineOrGroup);
      } else {
        const routineGroup = routineOrGroup as RoutineGroup;
        const routines = routineMap.get(routineGroup.getName());
        if(!routines) throw new Error(`RoutineGroup ${routineGroup.getName()} not found.`);

        routines.sort((a, b) => a.getProperties().getOrder() - b.getProperties().getOrder());
        const tasks = routines.map(routine => RoutineTask.fromRoutine(routine));
        return new TaskGroup(routineGroup.getName(), tasks);
      }
    });
    
    return new RoutineNote(day, root);
  }
}