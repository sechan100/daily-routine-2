import { ensureArchive } from "@entities/archives";
import { fileAccessor } from "@shared/file/file-accessor";
import { Day } from "@shared/period/day";
import { Notice, TAbstractFile, TFile } from "obsidian";
import { DR_SETTING } from "@app/settings/setting-provider";
import { doConfirm } from "@shared/components/modal/confirm-modal";
import { RoutineNote } from "../domain/note.type";
import { parseRoutineNote, serializeRoutineNote } from "./serializer";



const parseNote = async (day: Day, file: TFile): Promise<RoutineNote> => {
  const content = await fileAccessor.readFileAsReadonly(file);
  return parseRoutineNote(day, content);
};

export const ROUTINE_NOTE_FILE = (day: Day): TFile | null => {
  const path = ROUTINE_ARCHIVE_PATH(day);
  try {
    return fileAccessor.loadFile(path);
  } catch (e) {
    new Notice(`Error while loading note file. Please check the path: ${path}`);
    return null;
  }
};

export const ROUTINE_ARCHIVE_PATH = (day: Day) => {
  return `${DR_SETTING.noteFolderPath()}/${day.format()}.md`;
};


interface NoteRepository {
  // day에 해당하는 RoutineNote를 archive에서 가져온다. 
  load(day: Day): Promise<RoutineNote | null>;

  // start와 end를 '포함한' 사이의 모든 루틴 노트를 가져온다.
  loadBetween(start: Day, end: Day): Promise<RoutineNote[]>;

  isExist(day: Day): boolean;

  /**
   * 이미 routine note가 존재한다면 아무것도 하지 않는다.
   * @return 이미 해당 날짜의 노트가 존재했다면 false를 반환하고 아무동작도 하지 않는다.
   */
  persist(routineNote: RoutineNote): Promise<boolean>;

  /**
   * 노트를 저장한다. 만약 노트가 존재하지 않는다면 사용자의 입력을 받아서 저장여부를 결정한다.
   */
  saveOnUserConfirm(routineNote: RoutineNote): Promise<boolean>;

  save(routineNote: RoutineNote): Promise<void>;

  update(routineNote: RoutineNote): Promise<void>;

  updateIfExist(routineNote: RoutineNote): Promise<boolean>;

  delete(day: Day): Promise<void>;
}

export const noteRepository: NoteRepository = {

  async load(day: Day){
    const file = ROUTINE_NOTE_FILE(day);
    if(file){
      return await parseNote(day, file);
    } else {
      return Promise.resolve(null);
    }
  },

  async loadBetween(start: Day, end: Day): Promise<RoutineNote[]> {
    const notes: RoutineNote[] = [];
    const routineNoteFiles: TAbstractFile[] = (await ensureArchive("notes")).children.filter(file => file instanceof TFile);
    for(const file of routineNoteFiles){
      if(!(file instanceof TFile)) continue;
      const day = Day.fromString(file.basename);
      if(day.isBetween(start, end, 'day', '[]')){
        notes.push(await parseNote(day, file));
      }
    }
    return notes;
  },

  isExist(day: Day){
    return ROUTINE_NOTE_FILE(day) !== null;
  },

  async persist(routineNote) {
    const day = routineNote.day;
    const file = ROUTINE_NOTE_FILE(day);
    if(!file){
      const path = ROUTINE_ARCHIVE_PATH(day);
      try {
        await fileAccessor.createFile(path, serializeRoutineNote(routineNote));
      } catch (e) {
        await fileAccessor.createFolder(DR_SETTING.noteFolderPath());
        await fileAccessor.createFile(path, serializeRoutineNote(routineNote));
      }
      return true;
    } else {
      return false;
    }
  },

  async saveOnUserConfirm(routineNote: RoutineNote){
    const file = ROUTINE_NOTE_FILE(routineNote.day);

    if(file) {
      await noteRepository.update(routineNote);
      return true;
    } else {
      // 사용자 확인 대기
      const isUserConfirmed = await doConfirm({
        title: "Create Routine Note",
        description: `Create note for ${routineNote.day.format()}?`,
        confirmText: "Create",
        confirmBtnVariant: "accent",
      })

      // 사용자의 응답에 따라 처리
      if(isUserConfirmed) {
        await noteRepository.persist(routineNote);
      }
      return isUserConfirmed;
    }
  },

  async save(routineNote: RoutineNote){
    if(noteRepository.isExist(routineNote.day)){
      await noteRepository.update(routineNote);
    } else {
      await noteRepository.persist(routineNote);
    }
  },

  async update(routineNote: RoutineNote){
    const day = routineNote.day;
    const file = ROUTINE_NOTE_FILE(day);
    if(file){
      await fileAccessor.writeFile(file, () => serializeRoutineNote(routineNote));
    } else {
      throw new Error('RoutineNote file is not exist.');
    }
  },

  async updateIfExist(routineNote: RoutineNote){
    if(noteRepository.isExist(routineNote.day)){
      await noteRepository.update(routineNote);
      return true;
    } else {
      return false;
    }
  },
  
  async delete(day: Day){
    const file = ROUTINE_NOTE_FILE(day);
    if(file) await fileAccessor.deleteFile(file);
  }
}