import { moment, TFile } from "obsidian";
import { fileAccessor } from "shared/file/file-accessor";
import { plugin } from "shared/plugin-service-locator";
import { Day, DayOfWeek } from "shared/day";
import matter from "gray-matter";


/**
 * 루틴 파일에 대한 정보 객체
 */
export interface Routine {
  name: string; // 루틴 파일 제목 겸 루틴 내용
  properties: RoutineProperties; // 루틴 파일의 프로퍼티
}

export interface RoutineProperties {
  order: number; // routine들 순서(음이 아닌 정수 0, 1, 2, ...)
  dayOfWeeks: DayOfWeek[];
}


interface RoutineManager {
  /**
   * 모든 루틴들 가져오기
   * properties의 order를 기준으로 정렬되어 반환
   */
  getAllRoutines: () => Promise<Routine[]>;

  // 루틴 properties 변경
  editProperties: (routineName: string, properties: Partial<RoutineProperties>) => Promise<void>;

  // remane
  rename: (routineName: string, newName: string) => Promise<void>;

  // 루틴 가져오기
  get: (routineName: string) => Promise<Routine>;

  // 루틴 삭제하기
  delete: (routineName: string) => Promise<void>;

  // 루틴 생성하기
  create: (routine: Routine) => Promise<void>;

  // routine 순서 변경
  reorder: (routineNames: string[]) => Promise<void>;
}
export const routineManager: RoutineManager = {

  async getAllRoutines(){
    const path = getRoutineFolderPath();

    const parsedRoutines = [];
    for(const file of fileAccessor.getFolder(path).children){
      if(file instanceof TFile) {
        parsedRoutines.push(deserializeRoutine(file));
      } else {
        throw new Error('Routine folder contains non-file object.');
      }
    }
    const routines = await Promise.all(parsedRoutines);
    return routines.sort((a, b) => a.properties.order - b.properties.order);
  },

  async editProperties(routineName, newPropertiesPatial){
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);

    await fileAccessor.writeFile(file, (fileContent => {
      const { properties, content } = deserializeRoutineFileContent(fileContent);
      const newProps = {...properties, ...newPropertiesPatial};
      return `${serializeRoutineProperties(newProps)}\n${content}`;
    }));
  },

  async rename(routineName, newName){
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);
    if(newName !== routineName){
      try {
        await fileAccessor.renameFileWithLinks(file, getRoutinePath(newName));
      } catch (e) {
        console.error(e);
      }
    }
  },

  async get(routineName){
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);
    return await deserializeRoutine(file);
  },

  async delete(routineName: string){
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);
    await fileAccessor.deleteFile(file);
  },

  async create(routine: Routine){
    const path = getRoutinePath(routine.name);
    await fileAccessor.createFile(path, serializeRoutine(routine));
  },

  async reorder(routineNames){
    const routines = await Promise.all(routineNames.map(routineName => routineManager.get(routineName)));

    let newOrder = 0;
    for(const [i, routine] of routines.entries()){
      
      // 더이상 오름차순을 체크할 필요없이 계속 할당만 해나간다.
      if(newOrder !== 0){
        routine.properties.order = newOrder;
        routineManager.editProperties(routine.name, {order: newOrder});
        newOrder++;
        continue;
      }
      
      if(i + 1 === routines.length) break;
      // 오름차순이 아닌 경우
      if(!(routine.properties.order < routines[i+1].properties.order)) {
        // 해당 routine들 이후는 모두 걸린 루틴의 order + 1을 시작으로 1씩 올려서 할당한다.
        newOrder = routine.properties.order + 1;
      }
    }


  },


}


///////////////////////////////////////////////////////////////
// 직렬화 및 역직렬화 /////////////////////////////////////////////
//////////////////////////////////////////////////////////////
const serializeRoutineProperties = (properties: RoutineProperties) => {
  const props = {
    order: properties.order,
    dayOfWeeks: properties.dayOfWeeks.map(d => DayOfWeek[d])
  }
  return matter.stringify('', props);
}
const serializeRoutine = (routine: Routine) => {
  const properties = serializeRoutineProperties(routine.properties);
  const content = "";

  return `${properties}\n${content}`;
}


const deserializeRoutineFileContent = (fileContent: string): {properties: RoutineProperties, content: string } => {
  const { data, content } = matter(fileContent);

  // daysOfWeeks
  let dayOfWeeks = data.dayOfWeeks;
  if(dayOfWeeks){
    dayOfWeeks.map((d: keyof typeof DayOfWeek) => dayOfWeeks[d]);
  } else {
    dayOfWeeks = [];
  }

  return {
    content,
    properties: {
      order: data.order,
      dayOfWeeks
    }
  }
}
const deserializeRoutine = async (file: TFile): Promise<Routine> => {
  const fileContent = await fileAccessor.readFileAsReadonly(file);
  if(!fileContent) {
    throw new Error('Routine file is empty.');
  }
  
  const { properties, content } = deserializeRoutineFileContent(fileContent);

  return {
    name: file.name.replace('.md', ''),
    properties
  }
}

/**
 * 루틴 이름으로부터 루틴 파일의 경로를 가져온다.
 */
const getRoutinePath = (routineName: string) =>{
  return `${getRoutineFolderPath()}/${routineName}.md`
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