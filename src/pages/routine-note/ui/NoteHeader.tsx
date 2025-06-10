/** @jsxImportSource @emotion/react */
import { RoutineNote } from "@/entities/note";
import { openRoutineNoteFile } from "@/features/note";
import { STYLES } from "@/shared/colors/styles";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { openCreateRoutineModal } from "@/widgets/create-routine";
import { useCallback } from "react";




type Props = {
  note: RoutineNote;
}
export const NodeHeader = ({
  note,
}: Props) => {

  const handleNoteHeaderClick = useCallback(async () => {
    await openRoutineNoteFile(note.day);
  }, [note]);

  const handleCreateRoutineClick = useCallback(() => {
    openCreateRoutineModal({});
  }, []);

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
          fontSize: STYLES.fontSize.medium,
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
          onClick={handleCreateRoutineClick}
          pointer
        />
      </div>
    </header>
  )
}