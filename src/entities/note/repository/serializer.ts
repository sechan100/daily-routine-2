import { switchTo } from "@shared/utils/switch-utils";
import { isRoutineTask, isTask, isTaskGroup, isTodoTask, NoteElement, RoutineNote, RoutineTask, Task, TaskGroup, TaskState, TodoTask } from "../domain/note.type";
import { Day } from "@shared/period/day";
import { checkboxChars, TASKS_HEADING_REGEX, UNGROUPED_HEADING } from "./serialize-constants";


/*****************************************
 ************* Tasks Section *************
 *****************************************/

// Windows에서 저장된 노트(CRLF)도 같은 규칙으로 다루기 위해, 섹션 안은 LF로 바꿔서 다룬다. 섹션 밖은 한 byte도 건드리지 않는다.
const crlfToLf = (text: string) => text.replace(/\r\n/g, '\n');

// 파일에서 더 많이 쓰인 줄바꿈. 다시 쓰는 섹션에만 적용한다.
const dominantEol = (content: string) => {
  const crlf = content.match(/\r\n/g)?.length ?? 0;
  const lf = (content.match(/\n/g)?.length ?? 0) - crlf;
  return crlf > lf ? '\r\n' : '\n';
}

const toEol = (lfText: string, eol: string) => eol === '\n' ? lfText : lfText.replace(/\n/g, eol);

type TasksSectionRange = {
  start: number; // '# Tasks' heading의 시작
  bodyStart: number; // heading 줄의 끝. 섹션 본문은 여기서부터 '\n' 또는 '\r\n'으로 시작한다.
  end: number; // 다음 level-1 heading 앞 줄바꿈('\n' 또는 '\r\n')의 시작, 또는 파일 끝
}

// '# Tasks'부터 다음 level-1 heading 전까지가 플러그인이 관리하는 섹션이다.
const findTasksSection = (content: string): TasksSectionRange | null => {
  const headingMatch = content.match(TASKS_HEADING_REGEX);
  if(headingMatch === null || headingMatch.index === undefined) return null;
  const start = headingMatch.index + headingMatch[1].length;
  const bodyStart = headingMatch.index + headingMatch[0].length;
  const nextH1Idx = content.slice(bodyStart).search(/\n# /);
  if(nextH1Idx === -1) return { start, bodyStart, end: content.length };
  const newline = bodyStart + nextH1Idx;
  const end = newline > bodyStart && content[newline - 1] === '\r' ? newline - 1 : newline;
  return { start, bodyStart, end };
}

// 섹션 본문은 heading 줄 끝의 줄바꿈으로 시작하므로, 첫 원소(빈 문자열)는 버린다.
const sectionLines = (content: string, range: TasksSectionRange) => {
  return crlfToLf(content.slice(range.bodyStart, range.end)).split('\n').slice(1);
}


/*****************************************
 *********** String -> Entity ************
 *****************************************/

type ParsedTasksSection = {
  children: NoteElement[];
  preamble: string[];
}

// 정확히 level-2인 heading만 그룹으로 본다. '### Notes' 같은 하위 heading은 '##' 다음이 공백이 아니므로 매칭되지 않는다.
const parseHeadingName = (line: string): string | null => {
  const match = line.match(/^##[ \t]+(.*)$/);
  if(!match) return null;
  const rawName = match[1].trim();
  return rawName === '' ? null : rawName;
}

const createTaskGroup = (rawName: string): TaskGroup => {
  const isOpen = !/^\(.*\)$/.test(rawName); // 괄호로 감싸져 있으면 false, 아니면 true
  const name = rawName.replace(/^\((.*)\)$/, '$1').trim(); // 괄호 제거
  return {
    elementType: 'group',
    name,
    children: [],
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

// body는 길이에 제한이 없으므로 push(...lines)로 펼치지 않는다. 줄이 아주 많으면 call stack을 넘긴다.
const appendLines = (target: string[], lines: string[]) => {
  for(const line of lines) target.push(line);
}

const trimTrailingBlankLines = (lines: string[]) => {
  let end = lines.length;
  while(end > 0 && lines[end - 1].trim() === '') end--;
  return lines.slice(0, end);
}

/**
 * 섹션 본문의 줄들을 해석한다.
 *
 * task나 그룹 heading이 아닌 줄(하위 항목, 메모, '### ' heading 등)은 버리지 않고 바로 앞 요소에 붙여 보존한다.
 * - task 라인 뒤의 줄 → 그 task의 body
 * - '## 그룹' heading과 첫 task 사이의 줄 → 그 그룹의 body
 * - '# Tasks'와 첫 '##' heading 사이, '## UNGROUPED'와 첫 task 사이의 줄 → preamble.
 *   preamble은 어느 요소에도 속하지 않아 플러그인이 읽거나 바꿀 일이 없다. 모델에 두면 루틴으로부터 새로 만든 노트(병합)나
 *   오래된 화면의 노트로 저장할 때 지워지거나 되돌아가므로, 모델에 두지 않고 쓰는 순간의 파일에서 그대로 옮긴다(writeTasksSection).
 *   UNGROUPED 블록은 저장할 때마다 새로 만들어지므로, 그 heading 바로 아래에 있던 줄은 '# Tasks' 바로 아래로 옮겨진다.
 * 요소 사이의 빈 줄은 정리되지만(body 끝의 빈 줄 제거), 내용이 있는 줄은 모두 남는다.
 */
const parseTasksSection = (lines: string[]): ParsedTasksSection => {
  const children: NoteElement[] = [];
  const preamble: string[] = [];
  let group: TaskGroup | null = null;
  // 아직 주인을 정하지 않은 비-task 줄들과, 그 줄들이 붙을 요소(null이면 preamble)
  let owner: Task | TaskGroup | null = null;
  let pending: string[] = [];

  const flush = () => {
    const body = trimTrailingBlankLines(pending);
    pending = [];
    if(body.length === 0) return;
    if(owner) owner.body = body;
    else appendLines(preamble, body);
  }

  for(const line of lines){
    const headingName = parseHeadingName(line);
    if(headingName !== null){
      flush();
      if(headingName === UNGROUPED_HEADING){
        group = null;
        owner = null;
      } else {
        group = createTaskGroup(headingName);
        children.push(group);
        owner = group;
      }
      continue;
    }

    const task = parseTask(line);
    if(task){
      flush();
      if(group) group.children.push(task);
      else children.push(task);
      owner = task;
      continue;
    }

    pending.push(line);
  }
  flush();

  return { children, preamble };
}

const readTasksSection = (content: string): ParsedTasksSection => {
  const range = findTasksSection(content);
  // '# Tasks' 섹션이 없는 노트는 비어있는 노트로 취급한다.
  if(range === null) return { children: [], preamble: [] };
  return parseTasksSection(sectionLines(content, range));
}

export const parseRoutineNote = (day: Day, content: string): RoutineNote => {
  return {
    day,
    children: readTasksSection(content).children
  }
}

/*****************************************
 *********** Entity -> String ************
 *****************************************/
// dedent 같은 template tag는 보간된 값의 '\n', '\t' 같은 escape를 해석해서 이름의 '\'를 깨뜨리므로, 줄 배열을 join해서 만든다.

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

const serializeTaskLines = (task: Task): string[] => {
  return [serializeTask(task), ...(task.body ?? [])];
}

const serializeTaskGroup = (taskGroup: TaskGroup): string[] => {
  return [
    `## ${taskGroup.isOpen ? taskGroup.name : `(${taskGroup.name})`}`,
    ...(taskGroup.body ?? []),
    ...taskGroup.children.flatMap(serializeTaskLines),
  ];
}

// '# Tasks' heading 아래에 올 줄들. 그룹 밖의 연속된 task들은 하나의 UNGROUPED 블록으로 묶는다.
const serializeElements = (elements: NoteElement[]): string[] => {
  const lines: string[] = [];
  let inUngroupedBlock = false;
  for(const el of elements){
    if(isTaskGroup(el)){
      appendLines(lines, serializeTaskGroup(el));
      inUngroupedBlock = false;
    } else if(isTask(el)){
      if(!inUngroupedBlock) lines.push(`## ${UNGROUPED_HEADING}`);
      appendLines(lines, serializeTaskLines(el));
      inUngroupedBlock = true;
    } else {
      throw new Error('Invalid TaskElement Type');
    }
  }
  return lines;
}

export const serializeRoutineNote = (note: RoutineNote) => {
  return ['# Tasks', ...serializeElements(note.children)].join('\n');
}

// 같은 이름의 루틴과 할 일은 다른 task다. (merge-note의 TaskDataNoteDep와 같은 키)
const taskKey = (task: Task) => `${task.taskType}:${task.name}`;
const groupKey = (group: TaskGroup) => group.name;

const groupsOf = (elements: NoteElement[]) => elements.filter(isTaskGroup);
const tasksOf = (elements: NoteElement[]) => elements.flatMap(el => isTaskGroup(el) ? el.children : isTask(el) ? [el] : []);

const countKeys = <T>(items: T[], keyOf: (item: T) => string) => {
  const counts = new Map<string, number>();
  for(const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1);
  return counts;
}

/**
 * body가 undefined인 요소(루틴으로부터 새로 만든 task 등)에 현재 파일의 같은 요소가 가진 body를 채운다.
 * 키가 파일과 note 양쪽에서 정확히 한 번씩 나올 때만 물려준다. 겹치는 요소가 있으면 어느 body인지 알 수 없어,
 * 물려주면 body가 복제되거나 지운 요소의 body가 다른 요소 아래에 되살아난다.
 */
const fillMissingBodies = (elements: NoteElement[], current: NoteElement[]): NoteElement[] => {
  const inheritable = <T extends Task | TaskGroup>(currentItems: T[], items: T[], keyOf: (item: T) => string) => {
    const currentCounts = countKeys(currentItems, keyOf);
    const counts = countKeys(items, keyOf);
    const bodies = new Map<string, string[]>();
    for(const item of currentItems){
      const key = keyOf(item);
      if(item.body && currentCounts.get(key) === 1 && counts.get(key) === 1) bodies.set(key, item.body);
    }
    return (item: T): T => {
      if(item.body !== undefined) return item;
      const body = bodies.get(keyOf(item));
      return body ? { ...item, body } : item;
    }
  }
  const fillGroup = inheritable(groupsOf(current), groupsOf(elements), groupKey);
  const fillTask = inheritable(tasksOf(current), tasksOf(elements), taskKey);

  return elements.map(el => {
    if(isTaskGroup(el)) return { ...fillGroup(el), children: el.children.map(fillTask) };
    if(isTask(el)) return fillTask(el);
    return el;
  });
}

/**
 * 파일 내용에서 '# Tasks' 섹션만 note로 바꿔 쓴 새 파일 내용을 반환한다. 섹션 밖(frontmatter, 메모 등)은 그대로 둔다.
 *
 * 섹션 안에서 플러그인이 해석하지 않는 사용자 줄은 다음처럼 지킨다.
 * - preamble은 note가 아니라 현재 파일에서 그대로 옮긴다. (parseTasksSection 참고)
 * - note의 task·그룹의 body가 undefined면 현재 파일의 같은 요소의 body를 쓴다. 병합처럼 루틴으로부터 노트를 새로 만들면
 *   body가 비어 있어, 그대로 쓰면 사용자가 적어둔 하위 항목이 지워지기 때문이다. body를 지우려면 빈 배열을 넣는다.
 * - 섹션과 그 뒤 내용 사이의 빈 줄(파일 끝 개행 포함)은 문서의 간격이므로 유지한다.
 * - 다시 쓴 섹션에는 파일에서 더 많이 쓰인 줄바꿈(LF/CRLF)을 쓴다.
 */
export const writeTasksSection = (content: string, note: RoutineNote): string => {
  const eol = dominantEol(content);
  const range = findTasksSection(content);

  if(range === null){
    const serialized = toEol(serializeRoutineNote(note), eol);
    const body = content.trimEnd();
    return body === '' ? serialized : body + eol + eol + serialized;
  }

  const current = parseTasksSection(sectionLines(content, range));
  const section = [
    '# Tasks',
    ...current.preamble,
    ...serializeElements(fillMissingBodies(note.children, current.children)),
  ].join('\n');
  const sectionBody = crlfToLf(content.slice(range.bodyStart, range.end));
  const gap = sectionBody.slice(sectionBody.trimEnd().length).replace(/[^\n]/g, '');
  return content.slice(0, range.start) + toEol(section + gap, eol) + content.slice(range.end);
}
