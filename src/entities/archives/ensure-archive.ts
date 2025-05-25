import { fileAccessor } from "@/shared/file/file-accessor";
import { SETTINGS } from "@/shared/settings";

export type DrArchives = "notes" | "routines";


export const ensureArchive = async (archive: DrArchives) => {
  const archivePath = {
    notes: SETTINGS.noteFolderPath(),
    routines: SETTINGS.routineFolderPath(),
  }[archive];

  const folder = fileAccessor.loadFolder(archivePath);
  if (!folder) {
    return await fileAccessor.createFolder(archivePath);
  } else {
    return folder;
  }
}