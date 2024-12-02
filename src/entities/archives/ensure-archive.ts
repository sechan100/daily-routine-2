import { DR_SETTING } from "@app/settings/setting-provider";
import { fileAccessor } from "@shared/file/file-accessor";
import assert from "assert";

export type DrArchives = "notes" | "routines" | "data";


export const ensureArchive = async (archive: DrArchives) => {
  const archivePath = {
    notes: DR_SETTING.noteFolderPath(),
    routines: DR_SETTING.routineFolderPath(),
    data: DR_SETTING.dataFolderPath()
  }[archive];
  assert(archivePath, `Archive path is not set. ${archive}`);

  const folder = fileAccessor.getFolder(archivePath);
  if(!folder){
    return await fileAccessor.createFolder(archivePath);
  } else {
    return folder;
  }
}