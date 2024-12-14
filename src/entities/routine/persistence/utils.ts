import { DR_SETTING } from "@app/settings/setting-provider";


export const ROUTINE_FOLDER_PATH = () => {
  const path = DR_SETTING.routineFolderPath();
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


