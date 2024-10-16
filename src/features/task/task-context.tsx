import { RoutineNote } from "entities/routine-note";
import { createUseStateSyncedStore, UseStateRv } from "shared/zustand/create-use-state-synced-store";
import { TaskDndContext } from "./dnd-context";











const {StoreProvider, useStoreHook} = createUseStateSyncedStore<RoutineNote>();
export const useRoutineNoteState = useStoreHook;



interface TaskContextProps {
  useRoutineNoteState: UseStateRv<RoutineNote>;
  children: React.ReactNode;
}
export const TaskContext = ({ useRoutineNoteState, children }: TaskContextProps) => {
  return (
    <StoreProvider useState={useRoutineNoteState}>
      <TaskDndContext>
        {children}
      </TaskDndContext>
    </StoreProvider>
  )
}