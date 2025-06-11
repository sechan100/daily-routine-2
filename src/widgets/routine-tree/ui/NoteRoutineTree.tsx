import { Routine } from '@/entities/routine';
import { RoutineGroup } from '@/entities/routine-group';
import { useRef } from 'react';
import { RoutineTreeContext, RoutineTreeContextType } from '../model/context';
import { TreeRoot } from "./TreeRoot";




type Props = {
  /**
   * 제공된 routine에 대한 routine control을 여는 함수
   */
  openRoutineControls: (routine: Routine) => void;
  openRoutineGroupControls: (group: RoutineGroup) => void;
}
export const NoteRoutineTree = ({
  openRoutineControls,
  openRoutineGroupControls
}: Props) => {

  const context = useRef<RoutineTreeContextType>({
    openRoutineControls,
    openRoutineGroupControls
  });

  return (
    <RoutineTreeContext.Provider value={context.current}>
      <TreeRoot />
    </RoutineTreeContext.Provider>
  )
}