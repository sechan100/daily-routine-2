import { RoutineTree } from '@/entities/note';
import { RoutineTreeRoot } from "./RoutineTreeRoot";
import { RoutineTreeStoreProvider } from "./RoutineTreeStoreProvider";




type Props = {
  routineTree: RoutineTree;
}
export const NoteRoutineTreeWidget = ({
  routineTree,
}: Props) => {

  return (
    <RoutineTreeStoreProvider routineTree={routineTree}>
      <RoutineTreeRoot />
    </RoutineTreeStoreProvider>
  )
}