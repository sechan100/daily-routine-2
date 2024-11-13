import { TFile } from "obsidian";
import { fileAccessor } from "@shared/file/file-accessor";
import { plugin } from "@shared/plugin-service-locator";
import { RoutineFrontMatter } from "./front-matter";
import { validateRoutineProperties } from "./types";
import { Routine, RoutineProperties } from "./types";
import { Day } from "@shared/day";
import { RoutineTask, Task } from "@entities/note";


interface RoutineManager {
  /**
   * 모든 루틴들 가져오기
   * routine properties의 order를 기준으로 정렬.
   */
  getAllRoutines(): Promise<Routine[]>;

  editProperties(routineName: string, properties: Partial<RoutineProperties>): Promise<void>;

  rename(routineName: string, newName: string): Promise<void>;

  get(routineName: string): Promise<Routine>;

  delete(routineName: string): Promise<void>;

  create(routine: Routine): Promise<void>;

  reorder(routineNames: string[]): Promise<void>;

  isRoutineDueTo(routine: Routine, day: Day): boolean;
  
  deriveRoutineToTask(routine: Routine): RoutineTask;
}
export const routineManager: RoutineManager = {

  async getAllRoutines() {
    const path = getRoutineFolderPath();

    const parsedRoutines = [];
    for (const file of fileAccessor.getFolder(path).children) {
      if (file instanceof TFile) {
        parsedRoutines.push(parseRoutine(file));
      } else {
        throw new Error('Routine folder contains non-file object.');
      }
    }
    const routines = await Promise.all(parsedRoutines);
    return routines.sort((a, b) => a.properties.order - b.properties.order);
  },

  async editProperties(routineName, newPropertiesPatial) {
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);

    await fileAccessor.writeFrontMatter(file, (fm => {
      if (!validateRoutineProperties(fm)) throw new Error('Invalid Routine frontmatter.');

      const newProps = {
        ...fm,
        ...newPropertiesPatial
      };
      return newProps;
    }));
  },

  async rename(routineName, newName) {
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);
    if (newName !== routineName) {
      try {
        await fileAccessor.renameFileWithLinks(file, getRoutinePath(newName));
      } catch (e) {
        console.error(e);
      }
    }
  },

  async get(routineName) {
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);
    return await parseRoutine(file);
  },

  async delete(routineName: string) {
    const path = getRoutinePath(routineName);
    const file = fileAccessor.getFile(path);
    await fileAccessor.deleteFile(file);
  },

  async create(routine: Routine) {
    const path = getRoutinePath(routine.name);
    await fileAccessor.createFile(path, serializeRoutine(routine));
  },

  async reorder(routineNames) {
    const routines: Routine[] = [];
    for (const routineName of routineNames) {
      // 과거의 note를 편집할 때, 해당 루틴이 지금은 삭제된 루틴인 경우 이름을 찾을 수 없게됨.
      try {
        const routine = await routineManager.get(routineName);
        routines.push(routine);
      } catch (ignore) {
        //
      }
    }

    let newOrder = 0;
    for (const [i, routine] of routines.entries()) {

      // 더이상 오름차순을 체크할 필요없이 계속 할당만 해나간다.
      if (newOrder !== 0) {
        routine.properties.order = newOrder;
        routineManager.editProperties(routine.name, { order: newOrder });
        newOrder++;
        continue;
      }

      if (i + 1 === routines.length) break;
      // 오름차순이 아닌 경우
      if (!(routine.properties.order < routines[i + 1].properties.order)) {
        // 해당 routine들 이후는 모두 걸린 루틴의 order + 1을 시작으로 1씩 올려서 할당한다.
        newOrder = routine.properties.order + 1;
      }
    }
  },

  /**
   * NOTE: daysOfWeek와 daysOfMonth를 기준으로 루틴을 수행할지 말지를 결정한다.
   * - daysOfMonth가 0인 경우는 매월의 마지막 날을 의미한다.
   */
  isRoutineDueTo(routine: Routine, day: Day): boolean {

    // MONTH 기준
    if (routine.properties.activeCriteria === "month") {
      const days = Array.from(routine.properties.daysOfMonth);
      // 0이 존재하는 경우, 0을 매개받은 day의 달의 마지막 날짜로 치환한다.
      if (days.contains(0)) {
        const lastDayOfMonth = day.moment.daysInMonth();
        days.remove(0);
        days.push(lastDayOfMonth);
      }
      if (!days.contains(day.getDate())) return false;
    }

    // WEEK 기준
    if (routine.properties.activeCriteria === "week") {
      if (!routine.properties.daysOfWeek.contains(day.getDayOfWeek())) return false;
    }

    return true;
  },

  deriveRoutineToTask(routine: Routine): RoutineTask {
    return {
      type: "routine",
      name: routine.name,
      checked: false
    }
  },

}




///////////////////////////////////////////////////////////////
// 직렬화 및 역직렬화 /////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const serializeRoutine = (routine: Routine) => {
  const properties = new RoutineFrontMatter(routine.properties);
  const content = "";

  return `${properties.stringify()}\n${content}`;
}


const parseRoutine = async (file: TFile): Promise<Routine> => {
  const fileContent = await fileAccessor.readFileAsReadonly(file);
  if(!fileContent) {
    throw new Error('Routine file is empty.');
  }
  const fm = RoutineFrontMatter.fromContent(fileContent);

  return {
    name: file.name.replace('.md', ''),
    properties: fm.properties
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