import { fileAccessor } from "@/shared/file/file-accessor";
import { Day } from "@/shared/period/day";
import { SETTINGS } from "@/shared/settings";
import { getPlugin } from "@/shared/utils/plugin-service-locator";


/**
 * day에 해당하는 RoutineNote 파일을 main leaf에서 연다.
 */
export const openRoutineNoteFile = async (day: Day) => {
  const noteLink = SETTINGS.getNoteFolderPath() + `/${day.format()}.md`;
  const noteFile = fileAccessor.loadFile(noteLink);
  if (!noteFile) {
    throw new Error(`Note file not found: ${noteLink}`);
  }
  await getPlugin().app.workspace.getLeaf().openFile(noteFile);
}