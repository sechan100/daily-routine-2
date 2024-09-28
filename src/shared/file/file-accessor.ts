import { TFile, TFolder } from "obsidian";
import { plugin } from "src/shared/utils/plugin-service-locator";


/**
 * 경로로부터 vault의 파일을 읽어온다.
 * 만약 경로에 존재하는 파일이 없거나 folder인 경우 에러
 */
const getFile = (path: string): TFile => {
  const file = plugin().app.vault.getAbstractFileByPath(path);
  if(file && file instanceof TFile) {
    return file;
  } else {
    throw new Error(`File not found: ${path}`);
  }
}


/**
 * 경로로부터 vault의 폴더를 읽어온다.
 * 만약 경로에 존재하는 폴더가 없거나 file인 경우 에러
 */
const getFolder = (path: string) => {
  const file = plugin().app.vault.getAbstractFileByPath(path);
  if(file && file instanceof TFolder) {
    return file;
  } else {
    throw new Error(`Folder not found: ${path}`);
  }
}


/**
 * 파일을 읽기전용으로 읽어온다.
 */
const readFileAsReadonly = async (file: TFile) => {
  return plugin().app.vault.read(file);
}





export const fileAccessor = {
  getFile,
  getFolder,
  readFileAsReadonly
}