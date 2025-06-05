/** @jsxImportSource @emotion/react */
import { routineTreeService } from "@/entities/note";
import { NoteRoutineTreeWidget } from "@/widgets/note-routine-tree";
import { NoteTaskList } from "@/widgets/note-tasks";
import { useMemo, useRef } from "react";
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { CHECKABLE_GROUP_PANEL_MIN_SIZE } from "../config";
import { useRoutineNoteStore } from "../hooks/use-routine-note";



type Props = {
  children?: React.ReactNode;
}
export const TasksAndRoutines = ({
  children,
}: Props) => {
  const panelGroupHandleRef = useRef<ImperativePanelGroupHandle>(null);
  const note = useRoutineNoteStore(n => n.note);

  const taskPanelMinSize = useMemo(() => {
    if (note.tasks.length === 0) {
      return 0;
    }
    return CHECKABLE_GROUP_PANEL_MIN_SIZE;
  }, [note.tasks.length]);

  const routinePanelMinSize = useMemo(() => {
    if (routineTreeService.getAllRoutines(note.routienTree).length === 0) {
      return 0;
    }
    return CHECKABLE_GROUP_PANEL_MIN_SIZE;
  }, [note.routienTree]);

  // useEffect(() => {
  //   const handler = panelGroupHandleRef.current;
  //   if (!handler) {
  //     return;
  //   }

  //   if (note.tasks.length === 0) {
  //     handler.setLayout([0, 100])
  //   }
  // }, [note.tasks.length, panelGroupHandleRef]);

  return (
    <>
      <PanelGroup
        ref={panelGroupHandleRef}
        autoSaveId={"routine-note-panel-group"}
        direction="vertical"
      >
        <Panel minSize={taskPanelMinSize} order={1}>
          <NoteTaskList day={note.day} tasks={note.tasks} />
        </Panel>
        <PanelResizeHandle
          hitAreaMargins={{ coarse: 30, fine: 5 }}
          css={{
            borderTop: `1px solid var(--background-modifier-border)`,
          }}
        />
        <Panel minSize={routinePanelMinSize} order={2}>
          <NoteRoutineTreeWidget routineTree={note.routienTree} />
        </Panel>
      </PanelGroup>
    </>
  )
}