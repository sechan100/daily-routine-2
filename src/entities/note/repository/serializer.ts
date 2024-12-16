import { isRoutineTask, isTask, isTaskGroup, isTodoTask, NoteElement, RoutineNote, RoutineTask, Task, TaskGroup, TodoTask } from "../domain/note.type";
import { Day } from "@shared/period/day";
import dedent from "dedent";

/**
 * 
 * @param block: 
 * `
 * ## {name}
 * ...tasks?
 * ` 형식의 마크다운 블록
 */
const parseTaskGroup = (block: string): TaskGroup => {
  const regex = /##\s*(.+?)\s*(?:\n([\s\S]*?))?(?=\n##|$)/;
  const match = block.match(regex);
  if(!match) throw new Error('invalid-task-group-format');
  const taskLines = match[2]?.trim().split("\n") ?? [];
  
  return {
    elementType: 'group',
    name: match[1].trim(),
    children: taskLines.map(l => parseTask(l))
  }
}

const parseTask = (line: string): Task => {
  line = line.trim();
  if(line === '') throw new Error('empty-line');

  const regex = /-\s*\[(x|\s?)\]\s*(\[\[(.*?)\]\]|(.*?))\s*%%(.*?)%%/;
  const match = line.match(regex);
  if(!match) throw new Error('invalid-task-format');
  
  const checked = match[1] === 'x';
  const name = match[3] || match[4];
  const metaData = JSON.parse(match[5]);

  return {
    elementType: 'task',
    taskType: metaData.type,
    name,
    checked,
    showOnCalendar: metaData.soc === 1,
  }
}

export const parseRoutineNote = (day: Day, content: string): RoutineNote => {
  const regex = /##\s+.*(?:\n(?!##|$).*)*/g;
  const blocks = content.match(regex);
  if(!blocks) throw new Error('no task blocks found');

  const root: NoteElement[] = blocks.flatMap(b => {
    if(b.startsWith("## UNGROUPED")){
      const lines = b.replace("## UNGROUPED", '').trim().split('\n');
      return lines.map(l => parseTask(l));
    } else {
      return parseTaskGroup(b) as NoteElement;
    }
  });

  return {
    day,
    children: root
  }
}

/////////////////////////////////////////////////////////////////////

const serializeRoutineTask = (routineTask: RoutineTask) => {
  const c = routineTask.checked ? 'x' : ' ';
  const meta = {
    type: routineTask.taskType,
    soc: Number(routineTask.showOnCalendar)
  }
  return `- [${c}] [[${routineTask.name}]]%%${JSON.stringify(meta)}%%`;
}

const serializeTodoTask = (todo: TodoTask) => {
  const c = todo.checked ? 'x' : ' ';
  const meta = {
    type: todo.taskType,
    soc: Number(todo.showOnCalendar)
  }
  return `- [${c}] ${todo.name}%%${JSON.stringify(meta)}%%`;
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

const serializeTaskGroup = (taskGroup: TaskGroup) => dedent`
  ## ${taskGroup.name}
  ${taskGroup.children.map(t => serializeTask(t)).join('\n')}
`;

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