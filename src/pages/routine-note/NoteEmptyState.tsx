/** @jsxImportSource @emotion/react */
import { t } from "@shared/i18n";


interface NoteEmptyStateProps {
  onAddTodo: () => void;
  onStartRoutine: () => void;
}
export const NoteEmptyState = ({ onAddTodo, onStartRoutine }: NoteEmptyStateProps) => {
  return (
    <div css={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75em",
      height: "100%",
      padding: "2em 1em",
      boxSizing: "border-box",
      textAlign: "center",
    }}>
      <div css={{ color: "var(--text-muted)" }}>
        {t("shell.note.empty")}
      </div>
      <div css={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.5em",
      }}>
        <button type="button" onClick={onAddTodo}>{t("shell.action.addTodo")}</button>
        <button type="button" onClick={onStartRoutine}>{t("shell.action.startRoutine")}</button>
      </div>
    </div>
  )
}
