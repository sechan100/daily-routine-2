/** @jsxImportSource @emotion/react */
import { useNoteDayStore } from "@/entities/note";
import { openRoutineNoteFile, useRoutineNoteQuery } from "@/features/note";
import { STYLES } from "@/shared/colors/styles";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { useRouter } from "@/shared/route/use-router";
import { openCreateRoutineModal } from "@/widgets/create-routine";
import { openCreateRoutineGroupModal } from "@/widgets/create-routine-group";
import { useCallback } from "react";




export const NoteHeader = () => {
  const { route } = useRouter();
  const day = useNoteDayStore(state => state.day);
  const { note } = useRoutineNoteQuery(day);

  const handleNoteHeaderClick = useCallback(async () => {
    await openRoutineNoteFile(note.day);
  }, [note]);

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
          fontSize: 17,
          padding: "1px 4px",
          cursor: "pointer",
        }}
      >
        {note.day.format()}
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
        <ObsidianIcon
          size='21px'
          icon="flame"
          onClick={() => route("achievement")}
          pointer
        />
      </div>
    </header>
  )
}