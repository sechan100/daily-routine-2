import { doConfirm } from "@/shared/components/modal/confirm-modal";
import { ensureFolder } from "@/shared/file/ensure-folder";
import { fileAccessor } from "@/shared/file/file-accessor";
import { Day } from "@/shared/period/day";
import { SETTINGS } from "@/shared/settings";
import { TAbstractFile, TFile } from "obsidian";
import { RoutineNote } from "../model/note";
import { deserializeRoutineNote, serializeRoutineNote } from "../serialize/note";


export const getNoteFile = (day: Day): TFile | null => {
  const path = getNotePath(day);
  return fileAccessor.loadFile(path);
};

export const getNotePath = (day: Day) => {
  return `${SETTINGS.getNoteFolderPath()}/${day.format()}.md`;
};


export interface NoteRepository {
  load(day: Day): Promise<RoutineNote | null>;
  loadBetween(start: Day, end: Day): Promise<RoutineNote[]>;
  isExist(day: Day): boolean;
  persist(routineNote: RoutineNote): Promise<boolean>;
  saveOnUserConfirm(routineNote: RoutineNote): Promise<boolean>;
  save(routineNote: RoutineNote): Promise<void>;
  update(routineNote: RoutineNote): Promise<void>;
  updateIfExist(routineNote: RoutineNote): Promise<boolean>;
  delete(day: Day): Promise<void>;
}
export const noteRepository: NoteRepository = {

  /**
   * day에 해당하는 RoutineNote를 archive에서 가져온다. 
   * @param day 
   * @returns 
   */
  async load(day: Day) {
    const file = getNoteFile(day);
    if (file) {
      return await deserializeRoutineNote(file);
    } else {
      return Promise.resolve(null);
    }
  },

  /**
   * start와 end를 '포함한' 사이의 모든 루틴 노트를 가져온다.
   * @param start 
   * @param end 
   * @returns 
   */
  async loadBetween(start: Day, end: Day): Promise<RoutineNote[]> {
    const notes: RoutineNote[] = [];
    const routineNoteFiles: TAbstractFile[] = (await ensureFolder(SETTINGS.getNoteFolderPath()))
      .children
      .filter(file => file instanceof TFile);
    for (const file of routineNoteFiles) {
      if (!(file instanceof TFile)) continue;
      const day = Day.fromString(file.basename);
      if (day.isBetween(start, end, 'day', '[]')) {
        notes.push(await deserializeRoutineNote(file));
      }
    }
    return notes;
  },

  isExist(day: Day) {
    return getNoteFile(day) !== null;
  },

  /**
   * 이미 routine note가 존재한다면 아무것도 하지 않는다.
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
        await ensureFolder(SETTINGS.getNoteFolderPath());
        await fileAccessor.createFile(path, serializeRoutineNote(routineNote));
      }
      return true;
    } else {
      return false;
    }
  },

  /**
   * 노트를 저장한다. 만약 노트가 존재하지 않는다면 사용자의 입력을 받아서 저장여부를 결정한다.
   */
  async saveOnUserConfirm(routineNote: RoutineNote) {
    const file = getNoteFile(routineNote.day);

    if (file) {
      await noteRepository.update(routineNote);
      return true;
    } else {
      // 사용자 확인 대기
      const isUserConfirmed = await doConfirm({
        title: "Create routine note",
        description: `Create note for ${routineNote.day.format()}?`,
        confirmText: "Create",
        confirmBtnVariant: "accent",
      })

      // 사용자의 응답에 따라 처리
      if (isUserConfirmed) {
        await noteRepository.persist(routineNote);
      }
      return isUserConfirmed;
    }
  },

  async save(routineNote: RoutineNote) {
    if (noteRepository.isExist(routineNote.day)) {
      await noteRepository.update(routineNote);
    } else {
      await noteRepository.persist(routineNote);
    }
  },

  async update(routineNote: RoutineNote) {
    const day = routineNote.day;
    const file = getNoteFile(day);
    if (file) {
      await fileAccessor.writeFile(file, () => serializeRoutineNote(routineNote));
    } else {
      throw new Error('RoutineNote file is not exist.');
    }
  },

  async updateIfExist(routineNote: RoutineNote) {
    if (noteRepository.isExist(routineNote.day)) {
      await noteRepository.update(routineNote);
      return true;
    } else {
      return false;
    }
  },

  async delete(day: Day) {
    const file = getNoteFile(day);
    if (file) await fileAccessor.deleteFile(file);
  }
}