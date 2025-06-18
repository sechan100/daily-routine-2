/** @jsxImportSource @emotion/react */
import { useRoutineTree } from "@/service/use-routine-tree";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { useMemo, useRef } from "react";
import { filterCompletedRoutines } from './filter-completed-routines';
import { renderRoutineTree } from "./render-routine-tree";



export const NoteRoutineTree = () => {
  const hideCompletedTasksAndRoutines = useSettingsStores(s => s.hideCompletedTasksAndRoutines);
  const { tree } = useRoutineTree();

  const ref = useRef<HTMLDivElement>(null);

  const filterdTree = useMemo(() => {
    if (!hideCompletedTasksAndRoutines) {
      return tree;
    } else {
      return filterCompletedRoutines(tree);
    }
  }, [hideCompletedTasksAndRoutines, tree]);


  return (
    <div
      ref={ref}
      css={{
        height: "100%",
        overflowY: "auto",
      }}
    >
      {filterdTree.root.map(nrl => renderRoutineTree(nrl, null, 0))}
    </div>
  )
}