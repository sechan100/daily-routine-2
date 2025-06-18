import { getPlugin } from "@/app/plugin";
import { fileAccessor } from "@/shared/file/file-accessor";
import { Day } from "@/shared/period/day";
import { useSettingsStores } from "@/stores/client/use-settings-store";


/**
 * day에 해당하는 RoutineNote 파일을 main leaf에서 연다.
 */
export const openRoutineNoteFile = async (day: Day) => {
  const noteLink = useSettingsStores.getState().noteFolderPath + `/${day.format()}.md`;
  const noteFile = fileAccessor.loadFile(noteLink);
  if (!noteFile) {
    throw new Error(`Note file not found: ${noteLink}`);
  }
  await getPlugin().app.workspace.getLeaf().openFile(noteFile);
}