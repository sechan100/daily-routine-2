import { CheckableState } from '../model/checkable';
import { RoutineNote } from '../model/note';
import { RoutineTree } from '../model/routine-tree';
import { routineTreeService } from './routine-tree-service';
import { RoutineBuilder } from './RoutineBuilder';


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
  #checkedTasks: [string, CheckableState][] = [];

  constructor(tree: RoutineTree) {
    super();
    this.#checkedTasks = routineTreeService.getAllRoutines(tree)
      .filter(t => t.state !== 'un-checked')
      .map(t => [t.name, t.state]);
  }

  restoreData(tree: RoutineTree) {
    for (const routines of routineTreeService.getAllRoutines(tree)) {
      let originalTaskIndex: number;
      if ((originalTaskIndex = this.#checkedTasks.findIndex(([name]) => name === routines.name)) !== -1) {
        const [_, state] = this.#checkedTasks[originalTaskIndex];
        routines.state = state;
      }
    }
    return { ...tree };
  }
}

/**
 * routineBuilder를 사용하여 다시 routineTree를 생성한다.
 * @param tree 
 * @param routineBuilder 
 * @returns 
 */
const rebuildRoutine = (tree: RoutineTree, routineBuilder: RoutineBuilder): RoutineTree => {
  const dependents = [
    new CheckableStateNoteDep(tree)
  ];
  const newRoutineTree = routineBuilder.build(tree.day);
  for (const dep of dependents) {
    dep.restoreData(newRoutineTree);
  }
  return newRoutineTree;
}

/**
 * routineBuilder를 사용하여 note에 적용된 routineTree를 다시 생성한다.
 * 다른 데이터는 변경하지 않는다.
 * @param note 
 * @param routineBuilder 
 */
export const rebuildRoutineOfNote = (note: RoutineNote, routineBuilder: RoutineBuilder): RoutineNote => {
  const newTree = rebuildRoutine(note.routienTree, routineBuilder);
  return {
    ...note,
    routienTree: newTree
  };
}


