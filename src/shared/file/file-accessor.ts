import { TFile, TFolder } from "obsidian";
import { plugin } from "shared/plugin-service-locator";
import { FileNotFoundError } from "./errors";



export const fileAccessor = {

  /**
   * 경로로부터 vault의 파일을 읽어온다.
   * @throws FileNotFoundError 만약 경로에 존재하는 파일이 없거나 folder인 경우 에러
   */
  getFile: (path: string): TFile => {
    const file = plugin().app.vault.getAbstractFileByPath(path);
    if(file && file instanceof TFile) {
      return file;
    } else {
      throw new FileNotFoundError(path);
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
   * 파일을 디스크에서 직접 읽어온다.
   * 파일을 수정할 때 사용한다.
   */
  readFileFromDisk: async (file: TFile) => {
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

  /**
   * 파일을 생성한다.
   */
  createFile: async (path: string, content: string) => {
    return plugin().app.vault.create(path, content);
  },

  /**
   * 파일을 삭제한다.
   */
  deleteFile: async (file: TFile) => {
    return plugin().app.vault.delete(file);
  },

  /**
   * 파일의 frontmatter를 수정한다.
   * frontmatter 객체는 json object로 전달된다.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeFrontMatter: async (file: TFile, frontMatterModifier: (frontmatter: any) => any) => {
    return plugin().app.fileManager.processFrontMatter(file, (fm) => {
      const newFm = frontMatterModifier(fm);
      Object.assign(fm, newFm);
    });
  }
}