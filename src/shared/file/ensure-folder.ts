import { fileAccessor } from "./file-accessor";


export const ensureFolder = async (folderPath: string) => {
  const folder = fileAccessor.loadFolder(folderPath);
  if (!folder) {
    return await fileAccessor.createFolder(folderPath);
  } else {
    return folder;
  }
}