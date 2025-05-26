import { fileAccessor } from "@/shared/file/file-accessor";
import { Day } from "@/shared/period/day";
import dedent from "dedent";
import { TFile } from "obsidian";
import { parseRoutineNote, serializeRoutines, serializeTodoTask } from "./note-serializer";
import { isRoutineTask, isTask, isTaskGroup, isTodoTask, NoteElement, Task, TaskGroup, TodoTask } from "./note-types";




export const migrateNote = async (file: TFile) => {
  const content = await fileAccessor.readFileAsReadonly(file);
  const day = Day.fromString(file.basename);
  const note = parseRoutineNote(day, content);

  const todos: TodoTask[] = [];
  const routines: NoteElement[] = [];

  const dispatchTask = (task: Task, parent: TaskGroup | null) => {
    if (isTodoTask(task)) {
      todos.push(task);
    }
    else if (isRoutineTask(task)) {
      if (parent) {
        parent.children.push(task);
      } else {
        routines.push(task);
      }
    }
    else {
      throw new Error(`Unknown task type: ${task.elementType}`);
    }
  }

  for (const element of note.children) {
    if (isTaskGroup(element)) {
      const copiedGroup: TaskGroup = {
        ...element,
        children: []
      };
      for (const task of element.children) {
        dispatchTask(task, copiedGroup);
      }
      routines.push(copiedGroup);
    }
    else if (isTask(element)) {
      dispatchTask(element, null);
    }
    else {
      throw new Error(`Unknown note element type: ${element.elementType}`);
    }
  }

  const serializedTodos = todos.map(serializeTodoTask).join('\n');
  const serializedRoutines = serializeRoutines(routines);

  const newNoteContent = dedent`
  \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n
  ---
  %% Please do not modify the content below. It may damage your Routine Note data. %%
  ${serializedTodos.length > 0 ? `# Tasks\n${serializedTodos}` : '# Tasks'}
  # Routines
  ${serializedRoutines}
  `;

  await fileAccessor.writeFile(file, () => newNoteContent);
}