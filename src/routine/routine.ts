import { TFile } from "obsidian";
import { fileAccessor } from "src/shared/file/file-accessor"
import { plugin } from "src/shared/utils/plugin-service-locator";
import { DayOfWeek } from "src/shared/utils/date-time";


/**
 * 루틴 파일에 대한 정보 객체
 */
export interface Routine {
  name: string; // 루틴 파일 제목 겸 루틴 내용
  dayOfWeeks: DayOfWeek[]; // 루틴이 수행되는 요일
}

/**
 * 모든 루틴들 가져오기
 */
export const getRoutines = async (): Promise<Routine[]> => {
  const path = plugin().settings.routineFolderPath;
  if(!path) {
    throw new Error('Routine folder path is not set.');
  }

  const parseRoutineTasks = [];
  for(const file of fileAccessor.getFolder(path).children){
    if(file instanceof TFile) {
      parseRoutineTasks.push(parseRoutineFile(file));
    } else {
      throw new Error('Routine folder contains non-file object.');
    }
  }
  return await Promise.all(parseRoutineTasks);
}


/**
 * 루틴 파일을 파싱하여 Routine 객체로 변환
 * @param file 루틴 파일
 */
const parseRoutineFile = async (file: TFile): Promise<Routine> => {
  const content = await fileAccessor.readFileAsReadonly(file);
  if(!content) {
    throw new Error('Routine file is empty.');
  }

  // ---과 --- 사이의 내용을 추출
  const propertyString = content.replace("\n", "").match(/---([\s\S]*?)---/)?.[1];
  if(!propertyString) {
    throw new Error('Routine file does not have property.');
  }

  // 요일 정보 추출
  const dayOfWeeksMatched = propertyString.match(/dayOfWeeks:\s*(.*)/)?.[1]??'';
  const dayOfWeeks = dayOfWeeksMatched
  .split(',')
  .filter(d => d.trim().length > 0)
  .flatMap(d => {
    const day = d.trim()
    switch(day) {
      case 'MON': return DayOfWeek.MON;
      case 'TUE': return DayOfWeek.TUE;
      case 'WEN': return DayOfWeek.WEN;
      case 'THU': return DayOfWeek.THU;
      case 'FRI': return DayOfWeek.FRI;
      case 'SAT': return DayOfWeek.SAT;
      case 'SUN': return DayOfWeek.SUN;
      default: return [];
    }
  });

  return {
    name: file.name.replace('.md', ''),
    dayOfWeeks: dayOfWeeks
  }
}
