/* eslint-disable fsd-import/public-api-imports */
import { ensureFolder } from "@/shared/file/ensure-folder";
import { fileAccessor } from "@/shared/file/file-accessor";
import { useSettingsStores } from "@/shared/settings";
import { getPlugin } from "@/shared/utils/plugin-service-locator";
import { Notice, TFile } from "obsidian";
import { UpdateMigrationPercentage } from "../migration-entrypoint";
import { migrateGroup } from "./migrate-group";
import { migrateNote } from "./migrate-note";
import { migrateRoutine } from "./migrate-routine";

const GROUP_PREFIX = "_g_";


export const isRequireMigration = async (): Promise<boolean> => {
  const anyRoutineFile = (await ensureFolder(useSettingsStores.getState().routineFolderPath))
    .children
    .find(file => file instanceof TFile && !file.name.startsWith(GROUP_PREFIX));

  if (!anyRoutineFile) {
    return false;
  }

  const fm = await fileAccessor.loadFrontMatter(anyRoutineFile as TFile);
  const hasActiveCriteria = fm && typeof fm === "object" && "activeCriteria" in fm;

  // activeCriteria property가 있다면 migration이 필요한 상태
  return hasActiveCriteria;
};



export const migrateTo2xx = async (updatePercentage: UpdateMigrationPercentage) => {
  // 기존 routineFolder를 복사하여 백업
  const dailyRoutineFolder = fileAccessor.loadFolder(useSettingsStores.getState().dailyRoutineFolderPath);
  if (!dailyRoutineFolder) {
    return;
  }
  const backupFolderPath = `${dailyRoutineFolder.name}-backup`;
  const vault = getPlugin().app.vault;
  const backupFolder = await vault.copy(dailyRoutineFolder, backupFolderPath);

  // ===== migration을 위한 기존 폴더의 데이터들 수집 ======
  const getNoteFolder = () => {
    const noteFolder = fileAccessor.loadFolder(dailyRoutineFolder.path + "/notes");
    if (!noteFolder) {
      new Notice("Daily routine note folder not found. Please check your settings.");
      throw new Error("Daily routine note folder not found.");
    }
    return noteFolder;
  }
  const getRoutineFolder = () => {
    const routineFolder = fileAccessor.loadFolder(dailyRoutineFolder.path + "/routines");
    if (!routineFolder) {
      new Notice("Daily routine routine folder not found. Please check your settings.");
      throw new Error("Daily routine routine folder not found.");
    }
    return routineFolder;
  }
  // 데이터 준비
  const routines: TFile[] = [];
  const groups: TFile[] = [];
  const notes: TFile[] = getNoteFolder().children.filter(file => file instanceof TFile) as TFile[];
  const allRoutineOrGroupFiles = getRoutineFolder();
  for (const file of allRoutineOrGroupFiles.children) {
    if (file instanceof TFile) {
      if (file.name.startsWith(GROUP_PREFIX)) {
        groups.push(file);
      } else {
        routines.push(file);
      }
    } else {
      const error = `Routine folder contains other folder '${file.path}'`;
      new Notice(error);
      throw new Error(error);
    }
  }
  // 진행률 표시를 위한 함수
  const totalFiles = routines.length + groups.length + notes.length;
  let processedFiles = 0;
  const updateProgress = () => {
    processedFiles++;
    const percentage = Math.floor((processedFiles / totalFiles) * 100);
    updatePercentage(percentage);
  }
  // START MIGRATION!
  for (const r of routines) {
    await migrateRoutine(r);
    updateProgress();
  }
  const groupFolder = await fileAccessor.createFolder(`${getRoutineFolder().path}/groups`);
  for (const g of groups) {
    await migrateGroup(g);
    updateProgress();
    await getPlugin().app.vault.rename(g, `${groupFolder.path}/${g.name.replace(GROUP_PREFIX, '')}`);
  }
  for (const n of notes) {
    await migrateNote(n);
    updateProgress();
  }
}