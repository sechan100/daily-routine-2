import { switchTo } from "@shared/utils/switch-utils";
import { isRoutineTask, isTask, isTaskGroup, isTodoTask, NoteElement, RoutineNote, RoutineTask, Task, TaskGroup, TaskState, TodoTask } from "../domain/note.type";
import { Day } from "@shared/period/day";
import dedent from "dedent";
import { checkboxChars } from "./serialize-constants";


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
const parseTaskGroup = (block: string): TaskGroup => {
  const regex = /##\s*(.+?)\s*(?:\n([\s\S]*?))?(?=\n##|$)/;
  const match = block.match(regex);
  if (!match) throw new Error('invalid-task-group-format');
  const taskLines = match[2]?.trim().split("\n") ?? [];
  
  const rawName = match[1].trim();
  const isOpen = !/^\(.*\)$/.test(rawName); // 괄호로 감싸져 있으면 false, 아니면 true
  const name = rawName.replace(/^\((.*)\)$/, '$1').trim(); // 괄호 제거
  
  return {
    elementType: 'group',
    name,
    children: taskLines.map(l => parseTask(l)),
    isOpen
  };
}

const parseTask = (line: string): Task => {
  line = line.trim();
  if(line === '') throw new Error('empty-line');

  const avaliableCheckMarkChars = [ ' ', ...checkboxChars.accomplished, ...checkboxChars.failed];

  // const regex = /-\s*\[(x|o|\s?)\]\s*(\[\[(.*?)\]\]|(.*?))\s*%%(.*?)%%/;
  const regex = new RegExp(
    `-\\s*\\[(${avaliableCheckMarkChars.join('|')})\\]\\s*(\\[\\[(.*?)\\]\\]|(.*?))\\s*%%(.*?)%%`
  );
  const match = line.match(regex);
  if(!match) throw new Error('invalid-task-format');
  
  const name = match[3] || match[4];
  const state: TaskState = (()=>{
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
      throw new Error(`[invalid task state char]: '${match[1]}' in task '${name}'. 
        valid chars are ${avaliableCheckMarkChars.join(', ')}`);
    }
  })();
  const metaData = JSON.parse(match[5]);

  return {
    elementType: 'task',
    taskType: metaData.type,
    name,
    state,
    showOnCalendar: metaData.soc === 1,
  }
}

export const parseRoutineNote = (day: Day, content: string): RoutineNote => {
  const formatCheckRegex = /# Tasks\s*.*/;
  if(!formatCheckRegex.test(content)) throw new Error('invalid-note-format');

  const regex = /##\s+.*(?:\n(?!##|$).*)*/g;
  const blocks = content.match(regex);
  if(!blocks) return {
    day,
    children: [] 
  };

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

const serializeRoutineTask = (routineTask: RoutineTask) => {
  const s = switchStateToChar(routineTask.state);
  const meta = {
    type: routineTask.taskType,
    soc: Number(routineTask.showOnCalendar)
  }
  return `- [${s}] [[${routineTask.name}]]%%${JSON.stringify(meta)}%%`;
}

const serializeTodoTask = (todo: TodoTask) => {
  const s = switchStateToChar(todo.state);
  const meta = {
    type: todo.taskType,
    soc: Number(todo.showOnCalendar)
  }
  return `- [${s}] ${todo.name}%%${JSON.stringify(meta)}%%`;
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