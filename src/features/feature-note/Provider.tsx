import { useEffect } from "react"
import { registerFeatureNoteUpdateEvent } from "./feature-note-updater"




interface FeatureNoteUpdateProviderProps {
  children: React.ReactNode,
  className?: string,
}
export const FeatureNoteUpdateProvider = (props: FeatureNoteUpdateProviderProps) => {
  
  useEffect(() => {
    const cleanup = registerFeatureNoteUpdateEvent([
      "createRoutine",
      "deleteRoutine",
      "reorderRoutine",
      "updateRoutineProperties",
    ]);
    return cleanup;
  }, [])

  return (
    <div className={props.className}>
      {props.children}
    </div>
  )
}