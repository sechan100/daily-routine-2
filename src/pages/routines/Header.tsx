/** @jsxImportSource @emotion/react */
import { openCreateRoutineGroupModal } from "@/components/create-routine-group/CreateRoutineGroupModal";
import { openCreateRoutineModal } from "@/components/create-routine/CreateRoutineModal";
import { openRoutineNoteFile } from "@/core/note/open-routine-note";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { useRouter } from "@/shared/route/use-router";
import { STYLES } from "@/shared/styles/styles";
import { useNoteDayStore } from "@/stores/client/use-note-day-store";
import { saveSettings, useSettingsStores } from "@/stores/client/use-settings-store";
import { useRoutineNoteQuery } from "@/stores/server/use-routine-note-query";
import { useCallback } from "react";




export const Header = () => {
  const hideCompletedTasksAndRoutines = useSettingsStores(s => s.hideCompletedTasksAndRoutines);
  const { route } = useRouter();
  const day = useNoteDayStore(state => state.day);
  const { note } = useRoutineNoteQuery(day);

  const handleNoteHeaderClick = useCallback(async () => {
    await openRoutineNoteFile(note.day);
  }, [note]);

  const toggleHideCompletedTasksAndRoutinesSetting = useCallback(async () => {
    await saveSettings({
      hideCompletedTasksAndRoutines: !hideCompletedTasksAndRoutines,
    });
  }, [hideCompletedTasksAndRoutines]);

  return (
    <header
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5em 0.7em",
        borderBottom: "1px solid var(--background-modifier-border)",
      }}
    >
      <span
        onClick={handleNoteHeaderClick}
        css={{
          fontWeight: STYLES.fontWeight.bold,
          fontSize: 20,
          padding: "1px 4px",
          cursor: "pointer",
        }}
      >
        Routines
      </span>
      <div css={{
        display: "flex",
        gap: "1.5em",
      }}>
        <ObsidianIcon
          size='21px'
          icon="alarm-clock-plus"
          onClick={() => openCreateRoutineModal({})}
          pointer
        />
        <ObsidianIcon
          size='21px'
          icon="folder"
          onClick={() => openCreateRoutineGroupModal({})}
          pointer
        />
      </div>
    </header>
  )
}