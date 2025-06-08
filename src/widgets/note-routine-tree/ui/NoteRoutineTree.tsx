import { RoutineTree, useRoutineTreeStore } from '@/entities/note';
import { Routine } from '@/entities/routine';
import { useEffect, useRef } from 'react';
import { RoutineTreeContext, RoutineTreeContextType } from '../stores/context';
import { RoutineTreeRoot } from "./RoutineTreeRoot";




type Props = {
  routineTree: RoutineTree;
  /**
   * 제공된 routine에 대한 routine control을 여는 함수
   */
  openRoutineControl: (routine: Routine) => void;
}
export const NoteRoutineTree = ({
  routineTree,
  openRoutineControl,
}: Props) => {
  const setTree = useRoutineTreeStore(state => state.setTree);

  const context = useRef<RoutineTreeContextType>({
    openRoutineControl,
  });

  useEffect(() => {
    setTree(routineTree);
  }, [routineTree, setTree]);

  return (
    <RoutineTreeContext.Provider value={context.current}>
      <RoutineTreeRoot />
    </RoutineTreeContext.Provider>
  )
}