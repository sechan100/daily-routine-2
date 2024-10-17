import { routineManager } from "entities/routine/routine";
import { Routine } from "./routine/types";
import { RoutineNote, routineNoteService, Task } from "entities/routine-note";
////////////////////////////////////
import { fileAccessor } from "shared/file/file-accessor";
import { plugin } from "shared/plugin-service-locator";
import { TAbstractFile, TFile } from "obsidian";
import { Day } from "shared/day";
import moment from "moment";
import { FileNotFoundError } from "shared/file/errors";



interface RoutineNoteArchiver {
  // day에 해당하는 RoutineNote를 archive에서 가져온다. 
  load: (day: Day) => Promise<RoutineNote | null>;

  // 루틴 노트를 저장한다.
  save: (routineNote: RoutineNote) => Promise<void>;

  // start와 end를 포함한 사이의 모든 루틴 노트를 가져온다.
  loadBetween: (start: Day, end: Day) => Promise<RoutineNote[]>;  
}

export const routineNoteArchiver: RoutineNoteArchiver = {

  load(day: Day){
    const file = getRoutineNoteFile(day);
    if(file){
      return parseFile(file);
    } else {
      return Promise.resolve(null);
    }
  },

  async save(routineNote: RoutineNote){
    const file = getRoutineNoteFile(routineNote.day);

    // 기존 파일이 있으면 덮어쓰기
    if(file){
      await fileAccessor.writeFile(file, () => routineNoteService.serialize(routineNote));
    // 기존 파일이 없으면 새로 생성
    } else {
      const path = getRoutineArchivePath(routineNote.day.getBaseFormat());
      const content = routineNoteService.serialize(routineNote);
      await fileAccessor.createFile(path, content);
    }
  },


  async loadBetween(start: Day, end: Day): Promise<RoutineNote[]> {
    const notes: RoutineNote[] = [];
    const s = start.moment;
    const e = end.moment;
    const routineNoteFiles: TAbstractFile[] = fileAccessor.getFolder(plugin().settings.routineArchiveFolderPath).children.filter(file => file instanceof TFile);
    for(const file of routineNoteFiles){
      if(!(file instanceof TFile)) continue;
      const day = moment(file.basename);
      if(day.isBetween(s, e, 'day', '[]')){
        notes.push(await parseFile(file));
      }
    }
    return notes;
  },

}




/**
 * 특정 day에 해당하는 routineNote file을 가져온다. 
 */
const getRoutineNoteFile = (day: Day): TFile | null => {
  const path = getRoutineArchivePath(day.getBaseFormat());
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
  return routineNoteService.deserialize(new Day(moment(file.basename)), content);
}




/**
 * 루틴 아카이브 파일 경로를 반환합니다.
 */
const getRoutineArchivePath = (routineNoteTitle: string) => {
  return `${plugin().settings.routineArchiveFolderPath}/${routineNoteTitle}.md`;
}