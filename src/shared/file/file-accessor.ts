import { TFile, TFolder } from "obsidian";
import { plugin } from "src/shared/utils/plugin-service-locator";



export const fileAccessor = {

  /**
   * 경로로부터 vault의 파일을 읽어온다.
   * 만약 경로에 존재하는 파일이 없거나 folder인 경우 에러
   */
  getFile: (path: string): TFile => {
    const file = plugin().app.vault.getAbstractFileByPath(path);
    if(file && file instanceof TFile) {
      return file;
    } else {
      throw new Error(`File not found: ${path}`);
    }
  },


  /**
   * 경로로부터 vault의 폴더를 읽어온다.
   * 만약 경로에 존재하는 폴더가 없거나 file인 경우 에러
   */
  getFolder: (path: string) => {
    const file = plugin().app.vault.getAbstractFileByPath(path);
    if(file && file instanceof TFolder) {
      return file;
    } else {
      throw new Error(`Folder not found: ${path}`);
    }
  },


  /**
   * 파일을 읽기전용으로 읽어온다.
   */
  readFileAsReadonly: async (file: TFile) => {
    return plugin().app.vault.cachedRead(file);
  },

  
  /**
   * 파일을 쓰기전용으로 읽어온다.
   */
  readFileAsWritable: async (file: TFile) => {
    return plugin().app.vault.read(file);
  },


  /**
   * 모든 링크들과 함께 파일 이름을 변경한다.
   */
  renameFileWithLinks: async (file: TFile, newName: string) => {
    return plugin().app.fileManager.renameFile(file, newName);
  },

  
  /** 
   * 현재 활성화되지 않은 파일을 파일을 수정한다.
   */
  writeFile: async (file: TFile, contentSupplier: (data: string) => string) => {
    return plugin().app.vault.process(file, contentSupplier);
  },

}