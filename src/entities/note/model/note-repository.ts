import { ensureFolder } from "@/shared/file/ensure-folder";
import { fileAccessor } from "@/shared/file/file-accessor";
import { Day } from "@/shared/period/day";
import { getSettings } from "@/shared/settings";
import { TAbstractFile, TFile } from "obsidian";
import { RoutineNote } from "../types/note";
import { deserializeRoutineNote, serializeRoutineNote } from "./serialize-note";


export const getNoteFile = (day: Day): TFile | null => {
  const path = getNotePath(day);
  return fileAccessor.loadFile(path);
}

export const getNotePath = (day: Day) => {
  return `${getSettings().noteFolderPath}/${day.format()}.md`;
}

class NoteRepository {

  /**
   * day에 해당하는 RoutineNote를 archive에서 가져온다. 
   * @param day 
   * @returns 
   */
  async load(day: Day): Promise<RoutineNote | null> {
    const file = getNoteFile(day);
    if (file) {
      const day = Day.fromString(file.basename);
      const fileContent = await fileAccessor.readFileFromDisk(file);
      return deserializeRoutineNote(day, fileContent);
    } else {
      return Promise.resolve(null);
    }
  }

  /**
   * start와 end를 '포함한' 사이의 모든 루틴 노트를 가져온다.
   * @param start 
   * @param end 
   * @returns 
   */
  async loadBetween(start: Day, end: Day): Promise<RoutineNote[]> {
    const notes: RoutineNote[] = [];
    const routineNoteFiles: TAbstractFile[] = (await ensureFolder(getSettings().noteFolderPath))
      .children
      .filter(file => file instanceof TFile);
    for (const file of routineNoteFiles) {
      if (!(file instanceof TFile)) continue;
      const day = Day.fromString(file.basename);
      if (day.isBetween(start, end, 'day', '[]')) {
        const fileContent = await fileAccessor.readFileFromDisk(file);
        notes.push(deserializeRoutineNote(day, fileContent));
      }
    }
    return notes;
  }

  isExist(day: Day): boolean {
    return getNoteFile(day) !== null;
  }

  /**
   * @return 이미 해당 날짜의 노트가 존재했다면 false를 반환하고 아무동작도 하지 않는다.
   */
  async persist(routineNote: RoutineNote): Promise<boolean> {
    const day = routineNote.day;
    const file = getNoteFile(day);
    if (!file) {
      const path = getNotePath(day);
      try {
        await fileAccessor.createFile(path, serializeRoutineNote(routineNote));
      } catch (e) {
        await ensureFolder(getSettings().noteFolderPath);
        await fileAccessor.createFile(path, serializeRoutineNote(routineNote));
      }
      return true;
    } else {
      return false;
    }
  }

  async save(routineNote: RoutineNote): Promise<void> {
    if (noteRepository.isExist(routineNote.day)) {
      await noteRepository.update(routineNote);
    } else {
      await noteRepository.persist(routineNote);
    }
  }

  async update(routineNote: RoutineNote): Promise<void> {
    const day = routineNote.day;
    const file = getNoteFile(day);
    if (file) {
      await fileAccessor.writeFile(file, () => serializeRoutineNote(routineNote));
    } else {
      throw new Error('RoutineNote file is not exist.');
    }
  }

  async updateWith(day: Day, updateFn: (prev: RoutineNote) => RoutineNote): Promise<void> {
    const file = getNoteFile(day);
    if (file) {
      await fileAccessor.writeFile(file, (prevContent) => {
        const prevNote = deserializeRoutineNote(day, prevContent);
        const updatedNote = updateFn(prevNote);
        return serializeRoutineNote(updatedNote);
      });
    } else {
      throw new Error('RoutineNote file is not exist.');
    }
  }

  async updateIfExist(routineNote: RoutineNote): Promise<boolean> {
    if (noteRepository.isExist(routineNote.day)) {
      await noteRepository.update(routineNote);
      return true;
    } else {
      return false;
    }
  }

  async delete(day: Day): Promise<void> {
    const file = getNoteFile(day);
    if (file) await fileAccessor.deleteFile(file);
  }
}

export const noteRepository = new NoteRepository();