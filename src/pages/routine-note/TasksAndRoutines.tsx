/** @jsxImportSource @emotion/react */
import { openTaskControlsModal } from "@/components/task-control/TaskControls";
import { NoteRoutineTree } from "@/pages/routine-note/routine-tree";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { useSettingsStores } from "@/stores/client/use-settings-store";
import { useRoutineNoteQuery } from "@/stores/server/use-routine-note-query";
import { Divider } from "@mui/material";
import { useEffect, useRef } from "react";
import { NoteTaskList } from "./note-tasks/NoteTaskList";
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
      <NoteRoutineTree />
    </>
  )
}