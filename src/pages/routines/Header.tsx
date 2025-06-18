/** @jsxImportSource @emotion/react */
import { openCreateRoutineGroupModal } from "@/components/create-routine-group/CreateRoutineGroupModal";
import { openCreateRoutineModal } from "@/components/create-routine/CreateRoutineModal";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";
import { STYLES } from "@/shared/styles/styles";




export const Header = () => {

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