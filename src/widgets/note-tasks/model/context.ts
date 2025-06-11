import { Task } from "@/entities/task";
import { createContext, useContext } from "react";




export type NoteTasksContextType = {
  openTaskControls: (task: Task) => void;
}

export const NoteTasksContext = createContext<NoteTasksContextType | null>(null);

export const useNoteTasksContext = () => {
  const context = useContext(NoteTasksContext);
  if (!context) {
    throw new Error("useNoteTasksContext must be used within a NoteTasksProvider");
  }
  return context;
}