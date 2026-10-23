/**
 * 병합은 그룹과 task를 이름으로 찾아 노트 의존 데이터를 되돌려놓는다.
 * 그래서 루틴·그룹 파일의 이름만 바꾸고 병합하면, 그룹 안의 todo는 그룹을 잃고 노트 맨 앞으로 밀려나고
 * 오늘 체크한 루틴은 이전 이름의 기록과 새 이름의 체크 안 된 task로 나뉜다.
 * 이를 막기 위해 오늘과 미래 노트 안의 이름도 함께 바꾼다. 과거 노트는 그때의 기록이므로 그대로 둔다.
 *
 * 병합과 겹치지 않도록 runExclusiveWithMerges 안에서 루틴·그룹 파일의 이름 변경과 함께 호출한다.
 */

import { isRoutineTask, isTaskGroup, noteRepository, RoutineNote, Task, TaskGroupEntity } from "@entities/note";
import { Day } from "@shared/period/day";


export const renameGroupInNote = (note: RoutineNote, oldName: string, newName: string): RoutineNote => ({
  ...note,
  children: note.children.map(el => isTaskGroup(el) && el.name === oldName ? { ...el, name: newName } : el),
});

export const renameRoutineInNote = (note: RoutineNote, oldName: string, newName: string): RoutineNote => {
  const rename = <T extends Task>(task: T): T => isRoutineTask(task) && task.name === oldName ? { ...task, name: newName } : task;
  return {
    ...note,
    children: note.children.map(el => {
      if(isTaskGroup(el)) return { ...el, children: el.children.map(rename) };
      if(isRoutineTask(el)) return rename(el);
      return el;
    }),
  };
}

export const renameGroupInNotes = (oldName: string, newName: string) => {
  return updateTodayAndFutureNotes(note => renameGroupInNote(note, oldName, newName));
}

export const renameRoutineInNotes = (oldName: string, newName: string) => {
  return updateTodayAndFutureNotes(note => renameRoutineInNote(note, oldName, newName));
}

/**
 * 그룹을 삭제할 때 오늘과 미래 노트에서도 그 그룹을 정리한다. (병합은 todo가 남은 그룹을 사용자 그룹으로 보고 유지하므로)
 * deleteTasks가 false면 그룹 안의 task들은 그룹 밖으로 꺼낸다.
 */
export const removeGroupInNotes = (groupName: string, deleteTasks: boolean) => {
  return updateTodayAndFutureNotes(note => TaskGroupEntity.deleteTaskGroup(note, groupName, deleteTasks));
}


const updateTodayAndFutureNotes = async (mutate: (note: RoutineNote) => RoutineNote): Promise<void> => {
  const days = (await noteRepository.loadBetween(Day.today(), Day.max())).map(n => n.day);
  for(const day of days){
    try {
      await noteRepository.updateWith(day, mutate);
    } catch(e) {
      // 이 노트만 이전 이름으로 남고, 다음 병합은 이름이 바뀐 줄 모르고 처리한다. 나머지 노트는 계속 바꾼다.
      console.error(`[Daily Routine] Failed to rename in note '${day.format()}'.`, e);
    }
  }
}
