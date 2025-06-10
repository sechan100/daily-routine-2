/** @jsxImportSource @emotion/react */
import { RoutineNote, routineTreeUtils } from "@/entities/note";
import { NoteTaskList } from "@/widgets/note-tasks";
import { openRoutineControlsModal } from "@/widgets/routine-controls";
import { openRoutineGroupControlsModal } from "@/widgets/routine-group-controls";
import { NoteRoutineTree } from "@/widgets/routine-tree";
import { useMemo, useRef } from "react";
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";


export const CHECKABLE_GROUP_PANEL_MIN_SIZE = 20;


type Props = {
  note: RoutineNote;
}
export const TasksAndRoutines = ({
  note
}: Props) => {
  const panelGroupHandleRef = useRef<ImperativePanelGroupHandle>(null);

  const taskPanelMinSize = useMemo(() => {
    if (note.tasks.length === 0) {
      return 0;
    }
    return CHECKABLE_GROUP_PANEL_MIN_SIZE;
  }, [note.tasks.length]);

  const routinePanelMinSize = useMemo(() => {
    if (routineTreeUtils.getAllRoutines(note.routineTree).length === 0) {
      return 0;
    }
    return CHECKABLE_GROUP_PANEL_MIN_SIZE;
  }, [note.routineTree]);

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
          css={{
            height: "4px",
            borderTop: `1px solid var(--background-modifier-border)`,
          }}
        />
        <Panel minSize={routinePanelMinSize} order={2}>
          <NoteRoutineTree
            routineTree={note.routineTree}
            openRoutineControls={routine => openRoutineControlsModal({ routine })}
            openRoutineGroupControls={group => openRoutineGroupControlsModal({ group })}
          />
        </Panel>
      </PanelGroup>
    </>
  )
}