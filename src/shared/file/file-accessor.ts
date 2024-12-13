/* eslint-disable @typescript-eslint/no-explicit-any */
import { plugin } from "@shared/plugin-service-locator";
import { TFile, TFolder } from "obsidian";



export interface FileAccessor {
  /**
   * 경로로부터 vault의 파일을 읽어온다.
   */
  loadFile: (path: string) => TFile | null;

  /**
   * 경로로부터 vault의 폴더를 읽어온다.
   */
  loadFolder: (path: string) => TFolder | null;

  /**
   * 폴더를 생성한다.
   * 이미 같은 경로의 폴더가 존재하면 에러.
   */
  createFolder: (path: string) => Promise<TFolder>;

  /**
   * 파일을 읽기전용으로 읽어온다.
   */
  readFileAsReadonly: (file: TFile) => Promise<string>;
    
  /**
   * 파일을 디스크에서 직접 읽어온다.
   * 파일을 수정할 때 사용한다.
   */
  readFileFromDisk: (file: TFile) => Promise<string>;

  /**
   * 모든 링크들과 함께 파일 이름을 변경한다.
   */
  renameFileWithLinks: (file: TFile, newName: string) => Promise<void>;

  /** 
   * 현재 활성화되지 않은 파일을 파일을 수정한다.
   */
  writeFile: (file: TFile, contentSupplier: (data: string) => string) => Promise<string>;

  /**
   * 파일을 생성한다.
   */
  createFile: (path: string, content: string) => Promise<TFile>;

  /**
   * 파일을 삭제한다.
   */
  deleteFile: (file: TFile) => Promise<void>;

  /**
   * 파일의 frontmatter를 수정한다.
   * frontmatter 객체는 json object로 전달된다.
   */
  writeFrontMatter: (file: TFile, frontMatterModifier: (frontmatter: any) => any) => Promise<void>;
}

export const fileAccessor: FileAccessor = {

  loadFile: (path) => {
    const file = plugin().app.vault.getAbstractFileByPath(path);
    if(file && file instanceof TFile) {
      return file;
    } else {
      return null;
    }
  },

  loadFolder: (path: string) => {
    const file = plugin().app.vault.getAbstractFileByPath(path);
    if(file && file instanceof TFolder) {
      return file;
    } else {
      return null;
    }
  },

  createFolder: (path: string) => {
    return plugin().app.vault.createFolder(path);
  },

  readFileAsReadonly: async (file: TFile) => {
    return await plugin().app.vault.cachedRead(file);
  },

  readFileFromDisk: async (file: TFile) => {
    return await plugin().app.vault.read(file);
  },

  renameFileWithLinks: async (file: TFile, newName: string) => {
    return await plugin().app.fileManager.renameFile(file, newName);
  },

  writeFile: async (file: TFile, contentSupplier: (data: string) => string) => {
    return await plugin().app.vault.process(file, contentSupplier);
  },

  createFile: async (path: string, content: string) => {
    return await plugin().app.vault.create(path, content);
  },

  deleteFile: async (file: TFile) => {
    return await plugin().app.vault.delete(file);
  },

  writeFrontMatter: async (file: TFile, frontMatterModifier) => {
    return await plugin().app.fileManager.processFrontMatter(file, (fm: any) => {
      const newFm = frontMatterModifier(fm);
      Object.assign(fm, newFm);
    });
  }
}