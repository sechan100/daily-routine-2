import { RoutineTree, useRoutineTreeStore } from '@/entities/note';
import { Routine } from '@/entities/routine';
import { RoutineGroup } from '@/entities/routine-group';
import { useEffect, useRef } from 'react';
import { RoutineTreeContext, RoutineTreeContextType } from '../model/context';
import { TreeRoot } from "./TreeRoot";




type Props = {
  routineTree: RoutineTree;
  /**
   * 제공된 routine에 대한 routine control을 여는 함수
   */
  openRoutineControls: (routine: Routine) => void;
  openRoutineGroupControls: (group: RoutineGroup) => void;
}
export const NoteRoutineTree = ({
  routineTree,
  openRoutineControls,
  openRoutineGroupControls
}: Props) => {
  const setTree = useRoutineTreeStore(state => state.setTree);

  const context = useRef<RoutineTreeContextType>({
    openRoutineControls,
    openRoutineGroupControls
  });

  useEffect(() => {
    setTree(routineTree);
  }, [routineTree, setTree]);

  return (
    <RoutineTreeContext.Provider value={context.current}>
      <TreeRoot />
    </RoutineTreeContext.Provider>
  )
}