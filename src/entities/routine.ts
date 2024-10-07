import { moment, TFile } from "obsidian";
import { fileAccessor } from "shared/file/file-accessor";
import { plugin } from "shared/plugin-service-locator";
import { Day, DayOfWeek } from "shared/day";
import { changeProperties, parseProperties } from "shared/file/utils";


/**
 * 루틴 파일에 대한 정보 객체
 */
export interface Routine {
  name: string; // 루틴 파일 제목 겸 루틴 내용
  properties: RoutineProperties; // 루틴 파일의 프로퍼티
}

export interface RoutineProperties {
  dayOfWeeks: DayOfWeek[];
}


interface RoutineManager {
  /**
   * 모든 루틴들 가져오기
   */
  getAllRoutines: () => Promise<Routine[]>;

  // 루틴 properties 변경
  edit: (routineName: string, properties: Partial<RoutineProperties>) => Promise<void>;

  // remane
  rename: (routineName: string, newName: string) => Promise<void>;

  // 루틴 가져오기
  get: (routineName: string) => Promise<Routine>;

  // 루틴 성취 업데이트
  updateAchievement: (cmd: {routineName: string, day: Day, checked: boolean}) => Promise<void>;

  // 루틴 삭제하기
  delete: (routineName: string) => Promise<void>;

  // 루틴 생성하기
  create: (routine: Routine) => Promise<void>;
}
export const routineManager: RoutineManager = {

  async getAllRoutines(){
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

  async edit(routineName, properties){
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);
    await updateRoutineProperties(file, properties);
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
    return await readRoutineFile(file);
  },

  /**
   * 루틴 성취 업데이트
   */
  async updateAchievement({routineName, day, checked}){
    const file = fileAccessor.getFile(getRoutinePath(routineName));
    const content = await fileAccessor.readFileFromDisk(file);
    if(!content){
      throw new Error('Routine file is empty.');
    }
    updateAchievement(file, {date: day.getBaseFormat(), checked});
  },

  /**
   * 루틴 삭제하기
   */
  async delete(routineName: string){
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);
    await fileAccessor.deleteFile(file);
  },

  /**
   * 루틴 생성하기
   */
  async create(routine: Routine){
    const path = getRoutinePath(routine.name);
    await fileAccessor.createFile(path, serializeRoutine(routine));
  },

}



interface Achievement {
  date: string; // YYYY-MM-DD
  checked: boolean;
}
/**
 * day에 따른 routine의 성취 로그를 추출해낸다.
 */
const getAchievements = (content: string): Achievement[] => {
  // # Achievement 섹션을 추출
  const achievementsRegex = /# Achievement\n((?:- \[(?: |x)\] \d{4}-\d{1,2}-\d{1,2}\n?)+)/;
  const achievementsString = content.match(achievementsRegex)?.[0]??'';
  if(!achievementsString || achievementsString.length === 0) {
    throw new Error("Routine file does not have 'Achievement' section.");
  }

  // - [ |x] YYYY-MM-DD 형식의 체크박스를 추출
  const checkboxRegex = /- \[( |x)\] \d{4}-\d{1,2}-\d{1,2}/i;
  const achievements = achievementsString.match(checkboxRegex)??[];

  return achievements.map(a => {
    const date = a.match(/\d{4}-\d{1,2}-\d{1,2}/)?.[0];
    if(!date) {
      throw new Error('Date format is invalid.');
    }
    const checked = a.includes('[X]') || a.includes('[x]');
    return {date, checked};
  });
}

/**
 * 성취 로그를 업데이트한다.
 * @param content 루틴 파일 내용
 * @param cmd 업데이트할 성취 로그
 * 만약 해당 achievement가 없다면 추가하고, 있다면 업데이트한다.
 */
const updateAchievement = (file: TFile, cmd: Achievement) => {
  const newAchievementLine = (date: string, checked: boolean) => `- [${checked?'x':' '}] ${date}`;
  const checkboxLineRegex = (date: string) => new RegExp(`- \\[(?: |x)\\] ${date}`);

  fileAccessor.writeFile(file, (content => {
    const targetRegex = checkboxLineRegex(cmd.date);
    // 이미 해당 날짜의 성취로그가 있으면 업데이트한다.
    if(content.match(targetRegex)){
      return content.replace(targetRegex, newAchievementLine(cmd.date, cmd.checked));

    // 해당 날짜의 성취로그가 없으면 날짜들의 순서를 유지하면서 새로 추가한다.
    } else {
      const achievements = content.substring(content.indexOf('# Achievement')).split('\n');
      achievements.remove("# Achievement");
      achievements.remove("");
      const cmdMoment = moment(cmd.date);

      // 최초 성취인 경우
      if(achievements.length === 0){
        return content.replace('# Achievement', `# Achievement\n${newAchievementLine(cmd.date, cmd.checked)}`);
      }

      for(const a of achievements){
        const aMoment = moment(a.match(/\d{4}-\d{1,2}-\d{1,2}/)?.[0]);
        if(aMoment.isBefore(cmdMoment)){
          return content.replace(a, `${newAchievementLine(cmd.date, cmd.checked)}\n${a}`);
        }
      }
      // 마지막에 추가
      const lastAchievement = achievements[achievements.length-1];
      return content.replace(lastAchievement, `${lastAchievement}\n${newAchievementLine(cmd.date, cmd.checked)}`);
    }
  }));
}


const serializeRoutine = (routine: Routine) => {return (
`---
  dayOfWeeks: ${routine.properties.dayOfWeeks.map(d => DayOfWeek[d]).join(', ')}
---
# Achievement
`);
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
 * RoutineProperties 문자열을 파싱한다. 
 * @param content RoutineFile 내용
 */
const parseRoutineProperties = (content: string): RoutineProperties => {
  // ---과 --- 사이의 내용을 추출
  const properties = parseProperties(content);

  // 요일 정보 추출
  const dayOfWeeks = properties.dayOfWeeks
  .split(',')
  .filter(d => d.trim().length > 0)
  .flatMap(d => {
    const day = d.trim()
    switch(day) {
      case 'MON': return DayOfWeek.MON;
      case 'TUE': return DayOfWeek.TUE;
      case 'WED': return DayOfWeek.WED;
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
  const content = await fileAccessor.readFileFromDisk(file);
  if(!content){
    throw new Error('Routine file is empty.');
  }

  const properties = parseRoutineProperties(content);
  if(newProperties.dayOfWeeks){
    properties.dayOfWeeks = newProperties.dayOfWeeks;
  }
  
  const newProps = {"dayOfWeeks": () => `${properties.dayOfWeeks.map(d => DayOfWeek[d]).join(', ')}\n` };
  

  fileAccessor.writeFile(file, (content => {
    const newContent = changeProperties(content, newProps);
    return newContent;
  }));
  
}