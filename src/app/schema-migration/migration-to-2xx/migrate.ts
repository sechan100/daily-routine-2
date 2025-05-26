/* eslint-disable fsd-import/public-api-imports */
import { ensureArchive } from "@/entities/archives";
import { GROUP_PREFIX } from "@/entities/routine-like/utils";
import { fileAccessor } from "@/shared/file/file-accessor";
import { SETTINGS } from "@/shared/settings";
import { getPlugin } from "@/shared/utils/plugin-service-locator";
import { Notice, TFile } from "obsidian";
import { UpdateMigrationPercentage } from "../migration-entrypoint";
import { migrateGroup } from "./migrate-group";
import { migrateNote } from "./migrate-note";
import { migrateRoutine } from "./migrate-routine";


export const isRequireMigration = async (): Promise<boolean> => {
  const anyRoutineFile = (await ensureArchive("routines"))
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
  // 기존 폴더 복제
  const dailyRoutineFolder = fileAccessor.loadFolder(SETTINGS.dailyRoutineFolderPath());
  if (!dailyRoutineFolder) {
    return;
  }
  const newDailyRoutineFolderPath = `${dailyRoutineFolder.name}-backup`;
  const existingBackupFolder = fileAccessor.loadFolder(newDailyRoutineFolderPath);
  // DEVONLY
  if (existingBackupFolder) {
    getPlugin().app.fileManager.trashFile(existingBackupFolder);
  }
  const newDailyRoutineFolder = await getPlugin().app.vault.copy(dailyRoutineFolder, newDailyRoutineFolderPath);
  const getNoteFolder = () => {
    const noteFolder = fileAccessor.loadFolder(newDailyRoutineFolder.path + "/notes");
    if (!noteFolder) {
      new Notice("Daily routine note folder not found. Please check your settings.");
      throw new Error("Daily routine note folder not found.");
    }
    return noteFolder;
  }
  const getRoutineFolder = () => {
    const routineFolder = fileAccessor.loadFolder(newDailyRoutineFolder.path + "/routines");
    if (!routineFolder) {
      new Notice("Daily routine routine folder not found. Please check your settings.");
      throw new Error("Daily routine routine folder not found.");
    }
    return routineFolder;
  }

  const routines: TFile[] = [];
  const groups: TFile[] = [];
  const notes: TFile[] = getNoteFolder().children.filter(file => file instanceof TFile);

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

  const totalFiles = routines.length + groups.length + notes.length;
  let processedFiles = 0;
  const updateProgress = () => {
    processedFiles++;
    const percentage = Math.floor((processedFiles / totalFiles) * 100);
    updatePercentage(percentage);
  }

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