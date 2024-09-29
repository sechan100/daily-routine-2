import { TFile } from "obsidian";
import { fileAccessor } from "src/shared/file/file-accessor"
import { plugin } from "src/shared/utils/plugin-service-locator";
import { DayOfWeek } from "src/shared/utils/moment-provider";


/**
 * 루틴 파일에 대한 정보 객체
 */
export interface Routine {
  name: string; // 루틴 파일 제목 겸 루틴 내용
  properties: RoutineProperties; // 루틴 파일의 프로퍼티
}

interface RoutineProperties {
  dayOfWeeks: DayOfWeek[];
}


export const routineManager = {

  /**
   * 모든 루틴들 가져오기
   */
  getAllRoutines: async (): Promise<Routine[]> => {
    const path = getRoutineFolderPath();

    const parsedRoutines = [];
    for(const file of fileAccessor.getFolder(path).children){
      if(file instanceof TFile) {
        parsedRoutines.push(readRoutineFile(file));
      } else {
        throw new Error('Routine folder contains non-file object.');
      }
    }
    return await Promise.all(parsedRoutines);
  },

  /**
   * 루틴파일 수정
   * @param routineName 루틴파일명: identifier
   * @param cmd 수정할 내용
   */
  editRoutine: async (routineName: string, cmd: {
    name?: string,
    newProperties?: Partial<RoutineProperties>
  }) => {
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);

    // 프로퍼티 변경
    if(cmd.newProperties){
      await updateRoutineProperties(file, cmd.newProperties);
    }

    // routine 이름 변경
    // 이름 변경을 가장 마지막에 해야 위의 변경사항들을 위해서 파일을 추적할 때, 바뀐 이름때문에 추적이 불가능해지는 경우가 발생하지 않는다.
    if(cmd.name && cmd.name !== routineName){
      try {
        await fileAccessor.renameFileWithLinks(file, getRoutinePath(cmd.name));
      } catch (e) {
        console.error(e);
      }
    }
  },

  /**
   * 루틴 가져오기
   * @param routineName 루틴파일명: identifier
   */
  getRoutine: async (routineName: string): Promise<Routine> => {
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);
    return await readRoutineFile(file);
  },

}

/**
 * 루틴 이름으로부터 루틴 파일의 경로를 가져온다.
 */
const getRoutinePath = (routineName: string) =>{
  return `${getRoutineFolderPath()}/${routineName}.md`
}


/**
 * 루틴 파일을 읽어서 Routine 객체로 변환
 * @param file 루틴 파일
 */
const readRoutineFile = async (file: TFile): Promise<Routine> => {
  const content = await fileAccessor.readFileAsReadonly(file);
  if(!content) {
    throw new Error('Routine file is empty.');
  }

  return {
    name: file.name.replace('.md', ''),
    properties: parseRoutineProperties(content)
  }
}


/**
 * 루틴 파일의 프로퍼티를 추출한다.
 * @param content RoutineFile 내용
 */
const matchRoutineProperties = (content: string) => {
  const propertyString = content.replace("\n", "").match(/---([\s\S]*?)---/)?.[1];
  if(!propertyString) {
    throw new Error('Routine file does not have property.');
  }
  return propertyString;
}

/**
 * RoutineProperties 문자열을 파싱한다. 
 * @param content RoutineFile 내용
 */
const parseRoutineProperties = (content: string): RoutineProperties => {
  // ---과 --- 사이의 내용을 추출
  const propertyString = matchRoutineProperties(content);

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
    dayOfWeeks: dayOfWeeks
  }
}


/**
 * 루틴 파일이 저장되는 폴더 경로를 가져온다.
 */
const getRoutineFolderPath = () => {  
  const path = plugin().settings.routineFolderPath;
  if(!path) {
    throw new Error('Routine folder path is not set.');
  }
  return path;
}


/**
 * 루틴 파일의 프로퍼티를 변경한다.
 * @param file 루틴 파일
 * @param newProperties 변경할 프로퍼티
 */
const updateRoutineProperties = async (file: TFile, newProperties: Partial<RoutineProperties>) => {
  const content = await fileAccessor.readFileAsWritable(file);
  if(!content){
    throw new Error('Routine file is empty.');
  }

  const properties = parseRoutineProperties(content);
  if(newProperties.dayOfWeeks){
    properties.dayOfWeeks = newProperties.dayOfWeeks;
  }
  
  const newPropertiesString = `dayOfWeeks: ${properties.dayOfWeeks.map(d => DayOfWeek[d]).join(', ')}\n`;

  fileAccessor.writeFile(file, (data => {
    const newContent = data.replace(matchRoutineProperties(content), newPropertiesString);
    return newContent;
  }));
  
}