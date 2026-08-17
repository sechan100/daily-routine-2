import { switchTo } from "@shared/utils/switch-utils";
import { isRoutineTask, isTask, isTaskGroup, isTodoTask, NoteElement, RoutineNote, RoutineTask, Task, TaskGroup, TaskState, TodoTask } from "../domain/note.type";
import { Day } from "@shared/period/day";
import dedent from "dedent";
import { checkboxChars, TASKS_HEADING_REGEX } from "./serialize-constants";


/*****************************************
 *********** String -> Entity ************
 *****************************************/

/**
 * 
 * @param block: 
 * `
 * ## {name}
 * ...tasks?
 * ` 형식의 마크다운 블록
 */
const parseTaskGroup = (block: string): TaskGroup | null => {
  const regex = /##\s*(.+?)\s*(?:\n([\s\S]*?))?(?=\n##|$)/;
  const match = block.match(regex);
  if (!match) return null;
  const taskLines = match[2]?.trim().split("\n") ?? [];

  const rawName = match[1].trim();
  const isOpen = !/^\(.*\)$/.test(rawName); // 괄호로 감싸져 있으면 false, 아니면 true
  const name = rawName.replace(/^\((.*)\)$/, '$1').trim(); // 괄호 제거

  return {
    elementType: 'group',
    name,
    children: taskLines.flatMap(l => {
      const task = parseTask(l);
      return task ? [task] : [];
    }),
    isOpen
  };
}

// task 형식이 아닌 라인(빈 줄, 사용자가 추가한 텍스트, 손상된 메타데이터 등)은 null을 반환한다.
const parseTask = (line: string): Task | null => {
  line = line.trim();
  if(line === '') return null;

  const avaliableCheckMarkChars = [ ' ', ...checkboxChars.accomplished, ...checkboxChars.failed];

  // name 그룹은 greedy로 매칭하여 마지막 %%...%% 쌍을 메타데이터로 사용한다. (이름에 '%'가 포함된 경우 대비)
  // 메타데이터 뒤에는 인라인 태그(' #tag1 #tag2')가 올 수 있다. 태그의 원본은 메타데이터 JSON이므로 파싱하지 않고 허용만 한다.
  const regex = new RegExp(
    `^-\\s*\\[(${avaliableCheckMarkChars.join('|')})\\]\\s*(\\[\\[(.*)\\]\\]|(.*))\\s*%%(.*?)%%(?:\\s+#[^\\s#%]+)*\\s*$`
  );
  const match = line.match(regex);
  if(!match) return null;

  const name = match[3] || match[4];
  const state: TaskState | null = (()=>{
    if(checkboxChars.accomplished.includes(match[1])){
      return 'accomplished';
    }
    else if(checkboxChars.failed.includes(match[1])){
      return 'failed';
    }
    else if(match[1] === ' '){
      return 'un-checked';
    }
    else {
      return null;
    }
  })();
  if(state === null) return null;

  let metaData;
  try {
    metaData = JSON.parse(match[5]);
  } catch {
    return null;
  }
  if(metaData?.type !== 'routine' && metaData?.type !== 'todo') return null;

  // 구버전 라인에는 tags가 없으므로 빈 배열로 기본값 처리한다.
  const tags: string[] = Array.isArray(metaData.tags)
    ? metaData.tags.filter((t: unknown): t is string => typeof t === 'string')
    : [];

  return {
    elementType: 'task',
    taskType: metaData.type,
    name,
    state,
    showOnCalendar: metaData.soc === 1,
    tags,
  }
}

export const parseRoutineNote = (day: Day, content: string): RoutineNote => {
  const headingMatch = content.match(TASKS_HEADING_REGEX);
  // '# Tasks' 섹션이 없는 노트는 비어있는 노트로 취급한다.
  if(headingMatch === null || headingMatch.index === undefined) return {
    day,
    children: []
  };

  // '# Tasks'부터 다음 level-1 heading 전까지만 파싱한다.
  let section = content.slice(headingMatch.index + headingMatch[0].length);
  const nextH1Idx = section.search(/\n# /);
  if(nextH1Idx !== -1) section = section.slice(0, nextH1Idx);

  const regex = /##\s+.*(?:\n(?!##|$).*)*/g;
  const blocks = section.match(regex);
  if(!blocks) return {
    day,
    children: []
  };

  const root: NoteElement[] = blocks.flatMap(b => {
    const firstLine = b.split('\n', 1)[0];
    if(/^##\s+UNGROUPED\s*$/.test(firstLine)){
      const lines = b.split('\n').slice(1);
      return lines.flatMap(l => {
        const task = parseTask(l);
        return task ? [task as NoteElement] : [];
      });
    } else {
      const group = parseTaskGroup(b);
      return group ? [group as NoteElement] : [];
    }
  });

  return {
    day,
    children: root
  }
}

/*****************************************
 *********** Entity -> String ************
 *****************************************/

const switchStateToChar = (state: TaskState) => {
  return switchTo<TaskState, string>(state, {
    'accomplished': checkboxChars.accomplished[0],
    'failed': checkboxChars.failed[0],
    'un-checked': ' '
  });
}

// '%%'가 이름에 포함되면 메타데이터 구분자와 충돌하므로 제거한다.
const sanitizeTaskName = (name: string) => {
  return name.replace(/%%/g, '');
}

// tag에 공백, '#', '%'가 포함되면 라인 형식을 깨뜨리므로 제거한다.
const sanitizeTags = (tags: string[]) => {
  return tags.map(t => t.replace(/[\s#%]/g, '')).filter(t => t !== '');
}

// 구버전 라인과의 byte 호환을 위해, tags가 비어있으면 메타데이터에 포함하지 않는다.
const serializeMeta = (task: Task, tags: string[]) => {
  const meta = {
    type: task.taskType,
    soc: Number(task.showOnCalendar),
    ...(tags.length > 0 ? { tags } : {})
  }
  return `%%${JSON.stringify(meta)}%%`;
}

// obsidian이 태그를 인식할 수 있도록 메타데이터 뒤에 인라인 태그를 덧붙인다.
const serializeInlineTags = (tags: string[]) => {
  return tags.length > 0 ? ' ' + tags.map(t => `#${t}`).join(' ') : '';
}

const serializeRoutineTask = (routineTask: RoutineTask) => {
  const s = switchStateToChar(routineTask.state);
  const tags = sanitizeTags(routineTask.tags ?? []);
  return `- [${s}] [[${sanitizeTaskName(routineTask.name)}]]${serializeMeta(routineTask, tags)}${serializeInlineTags(tags)}`;
}

const serializeTodoTask = (todo: TodoTask) => {
  const s = switchStateToChar(todo.state);
  const tags = sanitizeTags(todo.tags ?? []);
  return `- [${s}] ${sanitizeTaskName(todo.name)}${serializeMeta(todo, tags)}${serializeInlineTags(tags)}`;
}

const serializeTask = (task: Task) => {
  if(isRoutineTask(task)){
    return serializeRoutineTask(task);
  } else if(isTodoTask(task)){
    return serializeTodoTask(task);
  } else {
    throw new Error('Invalid Task Type');
  }
}

const serializeTaskGroup = (taskGroup: TaskGroup) => {
  return dedent`
    ## ${taskGroup.isOpen ? taskGroup.name : `(${taskGroup.name})`}
    ${taskGroup.children.map(t => serializeTask(t)).join('\n')}
  `;
}

export const serializeRoutineNote = (note: RoutineNote) => {
  type ElBlock = {
    isUngroupedTaskBlock: boolean;
    serialized: string;
  }
  const taskElBlocks: ElBlock[] = [];

  for(const el of note.children){
    let elBlock: ElBlock;

    if(isTaskGroup(el)){
      elBlock = {
        isUngroupedTaskBlock: false,
        serialized: serializeTaskGroup(el)
      }
    } else if(isTask(el)){
      const prev = taskElBlocks[taskElBlocks.length - 1];
      if(prev && prev.isUngroupedTaskBlock){
        prev.serialized += '\n' + serializeTask(el);
        continue;
      } else {
        elBlock = {
          isUngroupedTaskBlock: true,
          serialized: serializeTask(el)
        }
      }
    } else { 
      throw new Error('Invalid TaskElement Type'); 
    }

    taskElBlocks.push(elBlock);
  }

  const tasks = taskElBlocks.map(block => {
    if(block.isUngroupedTaskBlock){
      return dedent`
        ## UNGROUPED
        ${block.serialized}
      `;
    } else {
      return block.serialized;
    }
  }).join('\n');


  return dedent`
    # Tasks
    ${tasks}
  `;
}