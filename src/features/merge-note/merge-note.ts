import { RoutineNote } from "@entities/note";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { Day } from "@shared/period/day";
import { CarriedTaskNoteDep } from "./dependents/CarriedTaskNoteDep";
import { GroupDataNoteDep } from "./dependents/GroupDataNoteDep";
import { NoteDependent } from "./dependents/NoteDependent";
import { TaskDataNoteDep } from "./dependents/TaskDataNoteDep";


/**
 * 루틴으로부터 노트를 새로 만들고, 원래 노트에 쌓여있던 노트 의존 데이터를 복원한다.
 * @param today 오늘과 과거 노트에서는 기록(체크, 본문)이 남은 루틴 task를 루틴이 사라져도 지우지 않는다.
 */
export const mergeNote = (note: RoutineNote, noteCreator: RoutineNoteCreator, today: Day = Day.today()): RoutineNote => {
  const keepRoutineRecords = note.day.wholeDayDiff(today) <= 0;
  // note로부터 NoteDependent를 추출한다. 구체적인 추출 로직은 각 클래스의 생성자에서 담당한다.
  // 다시 만들어진 task·그룹에 데이터를 먼저 복원하고, 루틴으로부터 만들어지지 않는 요소는 마지막에 끼워넣는다.
  const dependents: NoteDependent[] = [
    new TaskDataNoteDep(note),
    new GroupDataNoteDep(note),
    new CarriedTaskNoteDep(note, keepRoutineRecords),
  ];
  return dependents.reduce((merged, dep) => dep.restoreData(merged), noteCreator.create(note.day));
}
