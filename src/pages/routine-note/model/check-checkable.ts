import { Checkable, CheckableState, noteService, RoutineNote } from "@/entities/note";



export const checkCheckable = async (note: RoutineNote, name: string, type: "task" | "routine", state: CheckableState): Promise<RoutineNote> => {
  const newNote = { ...note };
  let checkable: Checkable | null = null;
  if (type === "task") {
    checkable = noteService.findTask(newNote, name);
  } else if (type === "routine") {
    checkable = noteService.findRoutine(newNote, name);
  } else {
    throw new Error(`Invalid type: ${type}`);
  }
  if (checkable === null) {
    throw new Error(`Check state change target ${type} not found: ${name}`);
  }
  checkable = { ...checkable, state };
  await noteService.saveOnUserConfirm(newNote);
  return newNote;
}