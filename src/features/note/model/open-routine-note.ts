import { RoutineNote } from "@/entities/note";
import { fileAccessor } from "@/shared/file/file-accessor";
import { Day } from "@/shared/period/day";
import { SETTINGS } from "@/shared/settings";
import { getPlugin } from "@/shared/utils/plugin-service-locator";







interface OpenRoutineNoteFile {
  (routineNote: RoutineNote): Promise<void>;
  (day: Day): Promise<void>;
}

export const openRoutineNoteFile: OpenRoutineNoteFile = async (routineNoteOrDay) => {
  const day = 'day' in routineNoteOrDay ? routineNoteOrDay.day : routineNoteOrDay;
  const noteLink = SETTINGS.getNoteFolderPath() + `/${day.format()}.md`;
  const noteFile = fileAccessor.loadFile(noteLink);
  if (!noteFile) {
    throw new Error(`Note file not found: ${noteLink}`);
  }
  await getPlugin().app.workspace.getLeaf().openFile(noteFile);
}