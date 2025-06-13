import { noteRepository, RoutineNote, routineNoteQueryKeys, Task, useNoteDayStore } from "@/entities/note";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useRoutineNoteQuery } from "../api/use-routine-note-query";



export const useNoteTasks = () => {
  const day = useNoteDayStore(s => s.day);
  const queryClient = useQueryClient();
  const { note } = useRoutineNoteQuery(day);

  const updateTasks = useCallback(async (newTasks: Task[]) => {
    const newNote: RoutineNote = {
      ...note,
      tasks: newTasks
    }
    await noteRepository.update(newNote);
    queryClient.setQueryData<RoutineNote>(
      routineNoteQueryKeys.note(day),
      (prev) => {
        if (!prev) return prev;
        return newNote;
      }
    );
  }, [note, day, queryClient]);

  return {
    day,
    tasks: note.tasks,
    updateTasks
  }
}