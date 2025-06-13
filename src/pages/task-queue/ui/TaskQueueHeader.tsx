/** @jsxImportSource @emotion/react */
import { STYLES } from "@/shared/colors/styles";
import { ObsidianIcon } from "@/shared/components/ObsidianIcon";




export const TaskQueueHeader = () => {

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
          fontSize: STYLES.fontSize.large,
          padding: "5px 4px",
          cursor: "pointer",
        }}
      >
        Task Queue
      </span>
      <div css={{
        display: "flex",
        gap: "1.5em",
      }}>
        <ObsidianIcon
          size='21px'
          icon="alarm-clock-plus"
          onClick={() => { }}
          pointer
        />
        <ObsidianIcon
          size='21px'
          icon="folder"
          onClick={() => { }}
          pointer
        />
      </div>
    </header>
  )
}