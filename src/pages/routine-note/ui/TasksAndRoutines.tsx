/** @jsxImportSource @emotion/react */
import { useNoteDayStore } from "@/entities/note";
import { useRoutineNoteQuery } from "@/features/note";
import { useSettingsStores } from "@/shared/settings";
import { NoteTaskList } from "@/widgets/note-tasks";
import { openRoutineControls } from "@/widgets/routine-controls";
import { openRoutineGroupControls } from "@/widgets/routine-group-controls";
import { NoteRoutineTree } from "@/widgets/routine-tree";
import { openTaskControlsModal } from "@/widgets/task-control";
import { Divider } from "@mui/material";
import { useEffect, useRef } from "react";
import { useNotePanel } from "./use-note-panel";


export const TasksAndRoutines = () => {
  const day = useNoteDayStore(state => state.day);
  const { note } = useRoutineNoteQuery(day);
  const settings = useSettingsStores();

  const tasksPanelRef = useRef<HTMLDivElement>(null);
  const { tasksPanelHeight, optimizePanelLayout } = useNotePanel({
    tasksPanelRef,
  });

  // note, 설정 등이 변경되면 panel layout을 최적화합니다.
  useEffect(() => {
    optimizePanelLayout();
  }, [note, settings, optimizePanelLayout]);

  return (
    <>
      <div ref={tasksPanelRef}>
        <NoteTaskList
          openTaskControls={task => openTaskControlsModal({ task })}
        />
      </div>
      {tasksPanelHeight !== 0 && <Divider />}
      <NoteRoutineTree
        openRoutineControls={routine => openRoutineControls({ routine })}
        openRoutineGroupControls={group => openRoutineGroupControls({ group })}
      />
    </>
  )
}