import { ensureArchive } from "@entities/archives";
import { fileAccessor } from "@shared/file/file-accessor";
import { Day } from "@shared/period/day";
import { toAsciiDigits } from "@shared/period/ascii-digits";
import { Notice, TAbstractFile, TFile } from "obsidian";
import { DR_SETTING } from "@app/settings/setting-provider";
import { doConfirm } from "@shared/components/modal/confirm-modal";
import { formatFullDate, t } from "@shared/i18n";
import { RoutineNote } from "../domain/note.type";
import { parseRoutineNote, serializeRoutineNote, writeTasksSection } from "./serializer";



const parseNote = async (day: Day, file: TFile): Promise<RoutineNote> => {
  const content = await fileAccessor.readFileAsReadonly(file);
  return parseRoutineNote(day, content);
};

export const ROUTINE_NOTE_FILE = (day: Day): TFile | null => {
  const path = ROUTINE_ARCHIVE_PATH(day);
  try {
    return fileAccessor.loadFile(path) ?? findLegacyNoteFile(day);
  } catch {
    new Notice(t("tasks.note.loadFailed", { path }));
    return null;
  }
};

export const ROUTINE_ARCHIVE_PATH = (day: Day) => {
  return `${DR_SETTING.noteFolderPath()}/${day.format()}.md`;
};

/**
 * 이전 버전(1.0.11 이하)은 Obsidian 언어가 아랍어·페르시아어·힌디어 등이면 노트 파일 이름을 그 언어의 숫자로 만들었다('٢٠٢٦-١٠-٢٣.md').
 * 아직 이름을 바꾸지 못한 그런 파일도 같은 날짜의 노트로 찾는다.
 */
const findLegacyNoteFile = (day: Day): TFile | null => {
  const folder = fileAccessor.loadFolder(DR_SETTING.noteFolderPath());
  if(!folder) return null;
  const target = day.format();
  for(const file of folder.children){
    if(file instanceof TFile && file.extension === "md" && file.basename !== target && toAsciiDigits(file.basename) === target){
      return file;
    }
  }
  return null;
};

// 노트 파일 이름(아라비아 숫자로 바꾼 뒤)이 'YYYY-MM-DD'이면 그 날짜를, 아니면 null을 돌려준다.
const dayOfNoteFile = (file: TFile): Day | null => {
  const name = toAsciiDigits(file.basename);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(name) || !Day.isValidFormat(name)) return null;
  return Day.fromString(name);
};

// 노트 폴더가 없을 때만 만든다. 동시에 만들려다 이미 생긴 경우는 성공으로 본다.
const ensureNoteFolder = async () => {
  try {
    await ensureArchive("notes");
  } catch(e) {
    if(!fileAccessor.loadFolder(DR_SETTING.noteFolderPath())) throw e;
  }
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

  /**
   * 파일에 저장된 최신 노트에 mutate를 적용해 저장하고, 그 결과 노트를 반환한다.
   * 노트 파일이 없으면 아무것도 쓰지 않고 null을 반환한다.
   *
   * 읽기·변경·쓰기가 vault.process 한 번 안에서 일어나므로, 화면이 들고 있던 노트가 오래됐거나 다른 저장과 겹쳐도
   * 그 사이 파일에 생긴 변경(에디터에서 직접 체크, 동기화 등)을 덮어쓰지 않는다. mutate는 동기 함수여야 한다.
   * mutate가 아무것도 바꾸지 않으면 파일 내용을 바꾸지 않는다.
   */
  updateWith(day: Day, mutate: (current: RoutineNote) => RoutineNote): Promise<RoutineNote | null>;

  updateIfExist(routineNote: RoutineNote): Promise<boolean>;

  delete(day: Day): Promise<void>;

  /**
   * 이전 버전이 앱 언어의 숫자로 만든 노트 파일('٢٠٢٦-١٠-٢٣.md')의 이름을 'YYYY-MM-DD.md'로 바꾼다. (링크도 함께 갱신된다)
   * 같은 날짜의 새 파일이 이미 있으면 내용을 합칠 수 없으므로 그대로 두고, 그 파일 경로들을 돌려준다.
   */
  migrateLegacyFileNames(): Promise<{ renamed: number; conflicts: string[] }>;
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
    // 같은 날짜에 이전 버전의 숫자 이름 파일과 새 파일이 함께 있으면, 새 파일(이름이 이미 아라비아 숫자인 쪽)을 쓴다.
    const fileByDay = new Map<string, TFile>();
    for(const file of routineNoteFiles){
      if(!(file instanceof TFile)) continue;
      if(file.extension !== 'md') continue;
      // 노트 파일명 형식(YYYY-MM-DD)이 아닌 파일은 무시한다.
      const day = dayOfNoteFile(file);
      if(!day || !day.isBetween(start, end, 'day', '[]')) continue;
      const key = day.format();
      if(!fileByDay.has(key) || file.basename === key) fileByDay.set(key, file);
    }
    for(const [key, file] of fileByDay){
      notes.push(await parseNote(Day.fromString(key), file));
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
      await ensureNoteFolder();
      try {
        await fileAccessor.createFile(path, serializeRoutineNote(routineNote));
      } catch(e) {
        // 같은 날의 노트를 동시에 만들면(오늘 노트 생성이 겹치는 경우 등) 먼저 만든 쪽이 이긴다.
        if(fileAccessor.loadFile(path)) return false;
        throw e;
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
        title: t("tasks.note.createTitle"),
        description: t("tasks.note.createConfirm", { date: formatFullDate(routineNote.day) }),
        confirmText: t("common.create"),
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
      // '# Tasks' 섹션만 교체하고, 그 외의 사용자 컨텐츠(frontmatter, 메모 등)는 보존한다.
      await fileAccessor.writeFile(file, (data) => writeTasksSection(data, routineNote));
    } else {
      throw new Error('RoutineNote file is not exist.');
    }
  },

  async updateWith(day, mutate){
    const file = ROUTINE_NOTE_FILE(day);
    if(!file) return null;
    let updated: RoutineNote | null = null;
    await fileAccessor.writeFile(file, (data) => {
      const current = parseRoutineNote(day, data);
      updated = mutate(current);
      // 바뀐 task가 없으면 원래 내용을 그대로 돌려준다. 빈 줄 정리나 빈 섹션 추가만으로 파일을 바꾸지 않도록.
      if(serializeRoutineNote(updated) === serializeRoutineNote(current)) return data;
      return writeTasksSection(data, updated);
    });
    return updated;
  },

  async updateIfExist(routineNote: RoutineNote){
    if(noteRepository.isExist(routineNote.day)){
      await noteRepository.update(routineNote);
      return true;
    } else {
      return false;
    }
  },
  
  async migrateLegacyFileNames(){
    const folder = fileAccessor.loadFolder(DR_SETTING.noteFolderPath());
    const result = { renamed: 0, conflicts: [] as string[] };
    if(!folder) return result;
    const legacyFiles = folder.children.filter((file): file is TFile => {
      if(!(file instanceof TFile) || file.extension !== "md") return false;
      const day = dayOfNoteFile(file);
      return day !== null && day.format() !== file.basename;
    });
    for(const file of legacyFiles){
      const day = dayOfNoteFile(file);
      if(!day) continue;
      const path = ROUTINE_ARCHIVE_PATH(day);
      if(fileAccessor.loadFile(path)){
        result.conflicts.push(file.path);
        continue;
      }
      await fileAccessor.renameFileWithLinks(file, path);
      result.renamed++;
    }
    return result;
  },

  async delete(day: Day){
    const file = ROUTINE_NOTE_FILE(day);
    if(file) await fileAccessor.deleteFile(file);
  }
}