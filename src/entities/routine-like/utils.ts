import { SETTINGS } from "@/shared/settings";


export const ROUTINE_FOLDER_PATH = () => {
  const path = SETTINGS.routineFolderPath();
  if (!path) {
    throw new Error('Routine folder path is not set.');
  }
  return path;
};

export const ROUTINE_PATH = (routineName: string) => {
  return `${ROUTINE_FOLDER_PATH()}/${routineName}.md`;
};

export const GROUP_PREFIX = "_g_";

export const GROUP_PATH = (groupName: string) => {
  return `${ROUTINE_FOLDER_PATH()}/${GROUP_PREFIX}${groupName}.md`;
};


