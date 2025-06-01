import { Day } from '@/shared/period/day';
import { noteRepository } from '../repository/note-repository';
import { rebuildRoutineOfNote } from './rebuild-routines';
import { RoutineBuilder } from './RoutineBuilder';

/**
 * routine에 변경사항이 발생한 경우, '오늘을 포함하여 모든 미래의 노트'들을 이에 맞게 업데이트하고 저장한다.
 * 호출시, routine에 관한 변경사항이 완전히 끝난 상태에서 호출해야한다. (비동기 변경시 await로 순서보장)
 *
 * @param today '오늘' 날짜. 기본값은 오늘 날짜로 설정되어있다.
 */

export const mergeRoutineMutations = async (today: Day = Day.today()): Promise<void> => {
  const notes = await noteRepository.loadBetween(today, Day.max());
  const routineBuilder = await RoutineBuilder.withDiskAsync();
  const rebuilds = notes.map(async (n) => {
    const rebuild = rebuildRoutineOfNote(n, routineBuilder);
    await noteRepository.update(rebuild);
  });

  await Promise.all(rebuilds);
};
