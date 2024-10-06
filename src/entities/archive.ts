import { routineManager, Routine } from "entities/routine";
import { RoutineNote, Task, RoutineTask } from "entities/routine-note";
////////////////////////////////////
import { fileAccessor } from "libs/file/file-accessor";
import { plugin } from "libs/plugin-service-locator";
import { TFile } from "obsidian";
import { Day } from "libs/day";
import { FileNotFoundError } from "libs/file/errors";
import moment from "moment";


export const routineNoteArchiver = {

  /**
   * day에 해당하는 RoutineNote를 archive에서 가져온다. 
   * 만약 archive에 존재하지 않는다면 생성하고 저장한 뒤에 반환한다.
   */
  async getRoutineNote(day: Day): Promise<RoutineNote> {
    try {
      const file = archiveDAO.getRoutineNoteFile(day);
      return archiveDAO.parseFile(file);
    } catch(e) {
      if(!(e instanceof FileNotFoundError)) throw e;
      const newNote = await createNewRoutineNote(day);
      await archiveDAO.persistRoutineNote(newNote);
      return newNote;
    }
  },


  /**
   * 특정 routineNote의 task를 체크, 또는 체크해제한다.
   */
  async updateTaskCheck(routineNote: RoutineNote, taskName: string, checked: boolean){
    const task = routineNote.tasks.find(task => task.name === taskName);
    if(task){
      task.checked = checked;
    } else {
      throw new Error(`Task ${taskName} not found.`);
    }
    await archiveDAO.save(routineNote);
  },


  async getRoutineNotes(start: Day, end: Day): Promise<RoutineNote[]> {
    const notes: RoutineNote[] = [];
    const s = start.moment;
    const e = end.moment;
    const routineNoteFiles = fileAccessor.getFolder(plugin().settings.routineArchiveFolderPath).children.filter(file => file instanceof TFile);
    for(const file of routineNoteFiles){
      const day = moment(file.basename);
      if(day.isBetween(s, e, 'day', '[]')){
        notes.push(await archiveDAO.parseFile(file));
      }
    }
    return notes;
  },

}


const archiveDAO = {
  /**
   * routineNote를 직렬화한 데이터를 기반으로 routineNoteFile을 update한다.
   */
  save: async (routineNote: RoutineNote) => {
    const file = archiveDAO.getRoutineNoteFile(routineNote.day);
    await fileAccessor.writeFile(file, () => serializeRoutineNote(routineNote));
  },


  /**
   * 특정 day에 해당하는 routineNote file을 가져온다. 
   */
  getRoutineNoteFile: (day: Day): TFile => {
    const path = getRoutineArchivePath(day.getBaseFormat());
    return fileAccessor.getFile(path);
  },


  /**
   * routineNote를 file로 저장한다. 
   */
  persistRoutineNote: async (routineNote: RoutineNote): Promise<TFile> => {
    const path = getRoutineArchivePath(routineNote.day.getBaseFormat());
    const content = serializeRoutineNote(routineNote);
    return fileAccessor.createFile(path, content);
  },


  /**
   * routineNote file을 deserialize하여 RoutineNote entity로 변환한다.
   */
  parseFile: async (file: TFile): Promise<RoutineNote> => {
    const content = await fileAccessor.readFileAsReadonly(file);
    // const props = parseProperties(content);
    // "# Tasks" 이후의 내용을 tasks로 변환한다.
    const tasks: Task[] = content.split('# Tasks')[1].split('\n').flatMap(line => {
      if(line.trim() === '') return [];
      const checked = line.startsWith('- [x]');
      const name = line.split('] ')[1].replace('[[', '').replace(']]', '');
      return { name, checked };
    });

    return {
      day: new Day(moment(file.basename)),
      tasks
    };
  },
}



/**
 * 루틴 아카이브 파일 경로를 반환합니다.
 */
const getRoutineArchivePath = (routineNoteTitle: string) => {
  return `${plugin().settings.routineArchiveFolderPath}/${routineNoteTitle}.md`;
}


/**
 * RoutineNote 엔티티를 문자열로 변환한다.
 * 해당 함수는 RoutineNote 엔티티를 문자열 content로 변환하는 과정에서 그 형식에 대한 비즈니스 로직을 포함한다.
 */
const serializeRoutineNote = (routineNote: RoutineNote): string => {
  const content =
`---
---
# Tasks
${routineNote.tasks.map(task => {
  return `- [${task.checked ? 'x' : ' '}] [[${task.name}]]`
  }).join('\n')
}
`
  return content;
}


/**
 * 새로운 RoutineNote entity를 생성한다.
 */
const createNewRoutineNote = async (day: Day): Promise<RoutineNote> => {
  const routines = await routineManager.getAllRoutines();

  const tasks = routines.flatMap(routine => {
    const taskOrNull = deriveRoutineTask(routine, day);
    if(taskOrNull) return taskOrNull;
    else return [];
  });

  return {
    day: day,
    tasks: tasks
  };
};


/**
 * routine으로부터 Task를 파생시킨다.
 * @param routine
 * @param day
 * @returns RoutineTask | null 만약 routine이 day에 수행어야하는 루틴이 아니라면 null을 반환한다.
 */
const deriveRoutineTask = (routine: Routine, day: Day): RoutineTask | null => {
  if (!routine.properties.dayOfWeeks.contains(day.getDayOfWeek())) return null;

  return {
    name: routine.name,
    checked: false
  };
};

