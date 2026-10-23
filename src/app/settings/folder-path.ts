import { normalizePath } from "obsidian";


export const DEFAULT_FOLDER_PATH = "daily_routine";

/**
 * 폴더 경로 입력값을 설정에 저장할 값으로 바꾼다.
 * 입력란을 비우면 normalizePath("")가 "/"를 돌려주어 "//notes" 같은 경로가 만들어지므로, 기본 폴더로 되돌린다.
 */
export const toFolderPathSetting = (input: string): string => {
  const trimmed = input.trim();
  if(trimmed === "") return DEFAULT_FOLDER_PATH;
  return resolveFolderPath(normalizePath(trimmed));
}

/**
 * 저장된 폴더 경로를 실제로 쓸 경로로 바꾼다. 이전 버전에서 비어 있거나 "/"로 저장된 값도 기본 폴더로 되돌린다.
 */
export const resolveFolderPath = (stored: string | undefined): string => {
  if(!stored || stored === "/") return DEFAULT_FOLDER_PATH;
  return stored;
}
