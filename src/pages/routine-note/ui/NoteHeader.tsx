/** @jsxImportSource @emotion/react */
import { openRoutineNoteFile } from "@/features/note";
import { STYLES } from "@/shared/colors/palette";
import { useCallback } from "react";
import { useRoutineNoteStore } from "../hooks/use-routine-note";




type Props = {
  children?: React.ReactNode;
}
export const NodeHeader = ({
  children
}: Props) => {
  const note = useRoutineNoteStore(n => n.note);

  const handleNoteHeaderClick = useCallback(async () => {
    await openRoutineNoteFile(note);
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
        {/* <Icon size='21px' icon={addTodoIcon} onClick={() => AddTodoModal.open({})} />
          <MenuComponent size='21px' onMenuShow={onNoteMenuShow} icon="menu" /> */}
      </div>
    </header>
  )
}