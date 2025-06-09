import { UNGROUPED_GROUP_NAME } from '@/entities/routine-group';
import { deserializeTask, serializeTask, Task } from '@/entities/task';
import { Day } from "@/shared/period/day";
import dedent from "dedent";
import { RoutineNote } from '../types/note';
import { isNoteRoutine, isNoteRoutineGroup, NoteRoutineGroup, NoteRoutineLike } from '../types/note-routine-like';
import { deserializeNoteRoutine, deserializeNoteRoutineGroup, serializeNoteRoutineGroup } from "./serialize-note-routine-like";

const deserializeError = (message: string): Error => new Error(`[RoutineNote Deserialization Error]: ${message}`);


export const serializeRoutineNote = (note: RoutineNote): string => {
  // group 또는 routine으로 구성된 routineRoot를 group으로 묶는다.
  // root 바로 하위에 위치한 routine은 개수에 관계없이 UNGROUPED 그룹으로 묶여서 통일성있게 처리한다.
  const routineGroups: NoteRoutineGroup[] = [];
  for (const routienLike of note.routineTree.root) {
    if (isNoteRoutineGroup(routienLike)) {
      routineGroups.push(routienLike);
    }
    else if (isNoteRoutine(routienLike)) {
      let lastGroup: NoteRoutineGroup | null = null;
      if (routineGroups.length !== 0) {
        lastGroup = routineGroups[routineGroups.length - 1];
      }
      // 마지막 그룹이 없거나, UNGROUPED 그룹이 아닌 경우 새로운 UNGROUPED 그룹을 생성하여 추가한다.
      if (lastGroup === null || lastGroup.name !== 'UNGROUPED') {
        const newUngroupedGroup: NoteRoutineGroup = {
          name: 'UNGROUPED',
          routineLikeType: 'routine-group',
          routines: [],
          isOpen: true
        }
        lastGroup = newUngroupedGroup;
        routineGroups.push(newUngroupedGroup);
      }
      // 마지막 그룹에 현재 routine을 추가한다.
      lastGroup.routines.push(routienLike);
    }
    else {
      throw new Error('Invalid NoteRoutineLike Type');
    }
  }

  return note.userContent + dedent`
    %% daily-routine %%
    # Tasks
    ${note.tasks.map(t => serializeTask(t)).join('\n')}
    # Routines
    ${routineGroups.map(g => serializeNoteRoutineGroup(g)).join('\n')}
  `;
}

export const deserializeRoutineNote = (day: Day, fileContent: string): RoutineNote => {

  // '%% daily-routine %%'를 기준으로 앞에는 사용자 'content' 아래부터 역직렬화해야하는 note data이다.
  const contentAndNoteDataPart = fileContent.split(/%%\s*daily-routine\s*%%/);
  if (contentAndNoteDataPart.length < 2) {
    throw deserializeError('missing %% daily-routine %% marker in ' + day.format());
  }
  const userContent = contentAndNoteDataPart[0]; // userContent는 trim하지 않음
  const noteData = contentAndNoteDataPart[1].trim();

  // noteData를 '#Tasks'와 '# Routines'로 쪼갬
  const h1BlockRegex = /^#\s+.*(?:\n(?!#\s).*)*$/gm
  const h1Blocks = noteData.match(h1BlockRegex);
  if (!h1Blocks || h1Blocks.length < 2) {
    throw deserializeError('invalid note format: missing #Tasks or #Routines header');
  }
  const tasksBlock = h1Blocks[0].trim();
  const routinesBlock = h1Blocks[1].trim();

  // '#Tasks' 블록 파싱
  const taskLines = tasksBlock
    .replace("# Tasks", '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');
  const tasks: Task[] = taskLines.map(line => deserializeTask(line));

  // '#Routines' 블록 파싱
  const h2BlockRegex = /^##\s+[^\n]*(?:\n(?!##)[^\n]*)*$/gm;
  const routineGroupBlock = routinesBlock.match(h2BlockRegex);
  const routineRoot: NoteRoutineLike[] = [];
  if (routineGroupBlock) {
    for (const block of routineGroupBlock) {
      if (block.startsWith(`## ${UNGROUPED_GROUP_NAME}`)) {
        const lines = block.replace(`## ${UNGROUPED_GROUP_NAME}`, '').trim().split('\n');
        for (const line of lines) {
          if (line.trim() === '') continue; // 빈 줄은 무시
          routineRoot.push(deserializeNoteRoutine(line));
        }
      } else {
        const routineGroup = deserializeNoteRoutineGroup(block);
        routineRoot.push(routineGroup);
      }
    }
  }
  return {
    day,
    userContent,
    tasks,
    routineTree: {
      root: routineRoot
    }
  }
}
