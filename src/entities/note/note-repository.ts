import { NoteService } from "./routine-note-service";
import { RoutineNote } from "./types";
import { fileAccessor } from "@shared/file/file-accessor";
import { plugin } from "@shared/plugin-service-locator";
import { TAbstractFile, TFile } from "obsidian";
import { Day } from "@shared/period/day";
import { FileNotFoundError } from "@shared/file/errors";
import { doConfirm } from "@shared/components/modal/confirm-modal";



interface NoteRepository {
  // day에 해당하는 RoutineNote를 archive에서 가져온다. 
  load(day: Day): Promise<RoutineNote | null>;

  // start와 end를 포함한 사이의 모든 루틴 노트를 가져온다.
  loadBetween(start: Day, end: Day): Promise<RoutineNote[]>;

  /**
   * 이미 routine note가 존재한다면 에러를 발생시킨다.
   * @param routineNote 
   * @param strict 기본값 true, false로 설정한 경우 노트가 이미 존재한다면 에러를 발생시키지 않고 무시한다.
   */
  persist(routineNote: RoutineNote, strict?: boolean): Promise<void>;

  /**
   * 이미 routine note가 존재하지 않는다면 에러를 발생시킨다.
   * @param routineNote 
   * @param strict 기본값 true, false로 설정한 경우 노트가 존재하지 않는다면 에러를 발생시키지 않고 무시한다.
   */
  update(routineNote: RoutineNote, strict?: boolean): Promise<void>;

  /**
   * 이미 routine note가 존재한다면 update, 존재하지 않는다면 persist한다.
   */
  forceSave(routineNote: RoutineNote): Promise<void>;

  /**
   * 기왕이면 update, persist를 사용하도록 하지만, 
   * 만약 routine note가 아직 존재하지 않아서 persist하고 update해야하는 경우라면 해당 함수를 사용할 수 있다. 
   * @param routineNote
   * @returns 이미 노트가 존재했거나 새로 생성하여 업데이트에 성공한 경우 true, 변경사항을 취소한 경우 false를 반환한다.
   */
  saveOnUserConfirm(routineNote: RoutineNote): Promise<boolean>;

  // delete
  delete(day: Day): Promise<void>;
}

export const NoteRepository: NoteRepository = {

  load(day: Day){
    const file = getRoutineNoteFile(day);
    if(file){
      return parseFile(file);
    } else {
      return Promise.resolve(null);
    }
  },

  async loadBetween(start: Day, end: Day): Promise<RoutineNote[]> {
    const notes: RoutineNote[] = [];
    const routineNoteFiles: TAbstractFile[] = fileAccessor.getFolder(plugin().settings.noteFolderPath).children.filter(file => file instanceof TFile);
    for(const file of routineNoteFiles){
      if(!(file instanceof TFile)) continue;
      const day = Day.fromString(file.basename);
      if(day.isBetween(start, end, 'day', '[]')){
        notes.push(await parseFile(file));
      }
    }
    return notes;
  },

  async persist(routineNote, strict = true) {
    const file = getRoutineNoteFile(routineNote.day);
    if(!file){
      const path = getRoutineArchivePath(routineNote.day.format());
      const content = NoteService.serialize(routineNote);
      await fileAccessor.createFile(path, content);
    } else {
      if(strict) throw new Error('RoutineNote already exists.');
    }
  },

  async update(routineNote, strict = true) {
    const file = getRoutineNoteFile(routineNote.day);
    if(file){
      await fileAccessor.writeFile(file, () => NoteService.serialize(routineNote));
    } else {
      if(strict) throw new Error('RoutineNote does not exist.');
    }
  },

  async forceSave(routineNote) {
    const file = getRoutineNoteFile(routineNote.day);
    if(file){
      await NoteRepository.update(routineNote);
    } else {
      await NoteRepository.persist(routineNote);
    }
  },

  async saveOnUserConfirm(routineNote) {
    const file = getRoutineNoteFile(routineNote.day);
  
    // 기존 파일이 있으면 업데이트
    if(file) {
      await NoteRepository.update(routineNote);
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
        await NoteRepository.persist(routineNote);
      }
      return isUserConfirmed;
    }
  },
  
  
  async delete(day: Day){
    const file = getRoutineNoteFile(day);
    if(file) await fileAccessor.deleteFile(file);
  }
}




/**
 * 특정 day에 해당하는 routineNote file을 가져온다. 
 */
const getRoutineNoteFile = (day: Day): TFile | null => {
  const path = getRoutineArchivePath(day.format());
  try {
    return fileAccessor.getFile(path);
  } catch(e) {
    if(e instanceof FileNotFoundError) return null;
    else throw e;
  }
}


/**
 * routineNote file을 deserialize하여 RoutineNote entity로 변환한다.
 */
const parseFile = async (file: TFile): Promise<RoutineNote> => {
  const content = await fileAccessor.readFileAsReadonly(file);
  if(!content) throw new Error('RoutineNote file is empty.');
  return NoteService.deserialize(Day.fromString(file.basename), content);
}




/**
 * 루틴 아카이브 파일 경로를 반환합니다.
 */
const getRoutineArchivePath = (routineNoteTitle: string) => {
  return `${plugin().settings.noteFolderPath}/${routineNoteTitle}.md`;
}