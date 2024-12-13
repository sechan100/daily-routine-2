import { DR_SETTING } from "@app/settings/setting-provider";
import { fileAccessor } from "@shared/file/file-accessor";

export type DrArchives = "notes" | "routines";


export const ensureArchive = async (archive: DrArchives) => {
  const archivePath = {
    notes: DR_SETTING.noteFolderPath(),
    routines: DR_SETTING.routineFolderPath(),
  }[archive];

  const folder = fileAccessor.loadFolder(archivePath);
  if(!folder){
    return await fileAccessor.createFolder(archivePath);
  } else {
    return folder;
  }
}