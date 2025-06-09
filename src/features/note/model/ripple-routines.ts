import { CheckableState } from '@/entities/checkable';
import { RoutineNote, RoutineTree, isNoteRoutineGroup, noteRepository, routineTreeUtils } from '@/entities/note';
import { Day } from '@/shared/period/day';
import { compose } from '@/shared/utils/compose';
import { produce } from 'immer';
import { RoutineTreeBuilder } from './routine-tree-builder';


/**
 * Routine은 Routine 자체 file 말고도 특정 날짜의 노트와 밀접하게 연관되어있다.
 * 예를 들어, routine의 이름이나 속성 값 등은 routine file에 저장되지만,
 * routine의 checkableState와 같은 값들은 note에 저장된다.
 * 
 * routine을 rebuild할 때는, 먼저 note에 의존적인 routine 데이터를 뽑아낸다.
 * 이후 day에 일치하는 routineTree를 새롭게 생성하고, 거기에 뽑아낸 데이터를 복원해낸다.
 */
abstract class NoteDependentRoutineData {

  /**
   * 노트에 의존적인 데이터를 기존의 노트로 부터 분리해냈기 때문에, 이를 다시 새로운 노트에 복원해내야한다.
   */
  abstract restoreData(newTree: RoutineTree): RoutineTree;
}

class CheckableStateNoteDep extends NoteDependentRoutineData {
  private checkedTasks: [string, CheckableState][] = [];

  constructor(tree: RoutineTree) {
    super();
    this.checkedTasks = routineTreeUtils.getAllRoutines(tree)
      .filter(t => t.state !== 'unchecked')
      .map(t => [t.name, t.state]);
  }

  restoreData(tree: RoutineTree) {
    return produce(tree, (draftTree) => {
      for (const routines of routineTreeUtils.getAllRoutines(draftTree)) {
        let originalTaskIndex: number;
        if ((originalTaskIndex = this.checkedTasks.findIndex(([name]) => name === routines.name)) !== -1) {
          const [_, state] = this.checkedTasks[originalTaskIndex];
          routines.state = state;
        }
      }
    })
  }
}

class GroupOpenNoteDep extends NoteDependentRoutineData {
  private closedGroups: Set<string> = new Set<string>();

  constructor(tree: RoutineTree) {
    super();
    for (const nrl of tree.root) {
      if (isNoteRoutineGroup(nrl) && !nrl.isOpen) {
        this.closedGroups.add(nrl.name);
      }
    }
  }

  restoreData(tree: RoutineTree) {
    return produce(tree, (draftTree) => {
      for (const nrl of draftTree.root) {
        if (isNoteRoutineGroup(nrl) && this.closedGroups.has(nrl.name)) {
          nrl.isOpen = false;
        }
      }
      return draftTree;
    });
  }
}


/**
 * routine에 변경사항이 발생한 경우, '오늘을 포함하여 모든 미래의 노트'들을 이에 맞게 업데이트하고 저장한다.
 * 호출시, routine에 관한 변경사항이 완전히 끝난 상태에서 호출해야한다. (비동기 변경시 await로 순서보장)
 *
 * @param today '오늘' 날짜. 기본 값은 오늘 날짜로 설정되어있다.
 */

export const rippleRoutines = async (today: Day = Day.today()): Promise<void> => {
  const notes = await noteRepository.loadBetween(today, Day.max());
  const routineBuilder = await RoutineTreeBuilder.withRepositoriesAsync();
  for (const note of notes) {
    if (note.routineTree.root.length === 0) {
      continue; // 노트에 루틴이 없는 경우는 건너뛴다.
    }
    const dependents = [
      new CheckableStateNoteDep(note.routineTree),
      new GroupOpenNoteDep(note.routineTree)
    ];
    const newRoutineTree = routineBuilder.build(note.day);
    const composedDependentRestoreFn = compose(...dependents.map(dep => dep.restoreData.bind(dep)));
    const dependentDataRestoredTree = composedDependentRestoreFn(newRoutineTree);
    const newNote: RoutineNote = {
      ...note,
      routineTree: dependentDataRestoredTree
    };
    await noteRepository.update(newNote);
  }
}