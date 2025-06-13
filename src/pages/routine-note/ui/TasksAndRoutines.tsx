/** @jsxImportSource @emotion/react */
import { routineTreeUtils, useNoteDayStore } from "@/entities/note";
import { useRoutineNoteQuery } from "@/features/note";
import { NoteTaskList } from "@/widgets/note-tasks";
import { openRoutineControls } from "@/widgets/routine-controls";
import { openRoutineGroupControls } from "@/widgets/routine-group-controls";
import { NoteRoutineTree } from "@/widgets/routine-tree";
import { openTaskControlsModal } from "@/widgets/task-control";
import { useMemo, useRef } from "react";
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";


export const CHECKABLE_GROUP_PANEL_MIN_SIZE = 20;

export const TasksAndRoutines = () => {
  const day = useNoteDayStore(state => state.day);
  const { note } = useRoutineNoteQuery(day);
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
          <NoteTaskList
            openTaskControls={task => openTaskControlsModal({ task })}
          />
        </Panel>
        <PanelResizeHandle
          css={{
            height: "4px",
            borderTop: `1px solid var(--background-modifier-border)`,
          }}
        />
        <Panel minSize={routinePanelMinSize} order={2}>
          <NoteRoutineTree
            openRoutineControls={routine => openRoutineControls({ routine })}
            openRoutineGroupControls={group => openRoutineGroupControls({ group })}
          />
        </Panel>
      </PanelGroup>
    </>
  )
}