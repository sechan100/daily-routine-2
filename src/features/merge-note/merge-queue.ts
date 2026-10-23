import { noteRepository, RoutineNote } from "@entities/note";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { Day } from "@shared/period/day";
import { Notice } from "obsidian";
import { formatFullDate, formatNumber, t } from "@shared/i18n";
import { TaskDataNoteDep } from "./dependents/TaskDataNoteDep";
import { mergeNote } from "./merge-note";


/**
 * 지금 화면에 보이는 노트. 병합한 노트 중 이 노트와 날짜가 같은 노트를 화면에 반영한다.
 */
export type NoteView = {
  getNote: () => RoutineNote;
  setNote: (note: RoutineNote) => void;
}

type MergeRequest = {
  view: NoteView;
  // 사용자가 화면에서 직접 바꾼 노트(날짜별). 이 날짜들은 파일의 노트 대신 이 노트를 기준으로 저장한다.
  manualNotes: Map<string, RoutineNote>;
}

/**
 * 병합은 모든 노트를 하나씩 읽고 쓰는 긴 작업인데, 호출부 대부분은 기다리지 않고 호출한다.
 * 병합끼리 겹치면 늦게 끝난 쪽이 더 오래된 루틴 목록으로 계산한 결과를 덮어쓸 수 있으므로, 모듈 단위의 큐로 하나씩 실행한다.
 */
let tail: Promise<void> = Promise.resolve();
// 아직 시작하지 않은 큐의 마지막 병합. 그 사이에 들어온 병합 요청은 여기에 합친다(병합은 시작할 때 최신 루틴 목록을 읽는다).
let lastWaiting: { request: MergeRequest; done: Promise<boolean> } | null = null;
// 아직 시작하지 않은 모든 병합. 실행 중인 병합은 이들이 직접 바꾼 노트로 저장할 날짜를 건드리지 않는다.
const waitingRequests = new Set<MergeRequest>();

const enqueue = <T>(job: () => Promise<T>): Promise<T> => {
  const run = tail.then(job);
  tail = run.then(() => undefined, () => undefined);
  return run;
}

/**
 * 병합과 겹치면 안 되는 작업(루틴과 노트를 함께 바꾸는 작업)을 병합 큐에서 실행한다.
 * job 안에서 병합을 요청하고 기다리면 자기 자신을 기다리게 되므로 그러지 않는다.
 */
export const runExclusiveWithMerges = <T>(job: () => Promise<T>): Promise<T> => {
  // 이 작업 뒤에 들어온 병합 요청이 이 작업보다 앞선 병합에 합쳐지지 않도록 끊는다.
  lastWaiting = null;
  return enqueue(job);
}

/**
 * 루틴의 변경사항을 오늘과 미래 노트들에 병합한다. 호출부 다수가 fire-and-forget이므로 절대 reject하지 않는다.
 * 모든 노트를 병합했으면 true, 하나라도 실패했으면(실패는 Notice로 알린다) false로 resolve한다.
 * @param manualNote 화면의 노트를 사용자가 직접 바꾼 결과(DnD 등). 바로 화면에 반영하고, 사용자가 바꾼 배치를 유지한 채 저장한다. 파일이 없으면 저장하지 않는다.
 */
export const requestNotesMerge = (view: NoteView, manualNote?: RoutineNote): Promise<boolean> => {
  if(manualNote) view.setNote(manualNote);
  if(!lastWaiting){
    const request: MergeRequest = { view, manualNotes: new Map() };
    waitingRequests.add(request);
    const done = enqueue(async () => {
      waitingRequests.delete(request);
      if(lastWaiting?.request === request) lastWaiting = null;
      return await mergeAll(request);
    });
    lastWaiting = { request, done };
  }
  const { request, done } = lastWaiting;
  request.view = view;
  if(manualNote) request.manualNotes.set(manualNote.day.format(), manualNote);
  return done;
}


const mergeAll = async ({ view, manualNotes }: MergeRequest): Promise<boolean> => {
  // 하나의 note 병합이 실패해도 나머지 note들의 병합은 계속 진행하고, 실패한 날짜들을 모아서 알린다.
  const failedDays: string[] = [];
  const isClaimedByWaitingRequest = (day: Day) => [...waitingRequests].some(r => r.manualNotes.has(day.format()));

  // 읽기·변경·쓰기를 파일 하나에 대해 한 번에 하므로, 병합하는 동안 다른 곳에서 저장한 체크 상태 등을 덮어쓰지 않는다.
  const write = async (day: Day, mutate: (current: RoutineNote) => RoutineNote) => {
    // 뒤에 기다리는 요청이 이 날짜를 직접 바꾼 노트로 저장할 것이므로, 화면이 이전 상태로 잠깐 되돌아가지 않도록 건너뛴다.
    if(isClaimedByWaitingRequest(day)) return;
    try {
      const saved = await noteRepository.updateWith(day, mutate);
      // 병합하는 동안 다른 날짜로 옮겨갔을 수 있으므로, 저장한 시점에 보고 있는 노트와 비교한다.
      if(saved && view.getNote().day.isSameDay(day)) view.setNote(saved);
    } catch(e) {
      console.error(`Failed to merge note '${day.format()}'.`, e);
      failedDays.push(day.format());
    }
  }

  try {
    // 읽지 못한 루틴·그룹 파일이 있으면 노트를 다시 만들지 않는다. 일부만 읽은 목록으로 만들면 그 그룹과 루틴이 노트에서 지워지고,
    // 파일을 고친 뒤에도 그 그룹의 본문과 todo 위치는 돌아오지 않는다.
    const creatorResult = await RoutineNoteCreator.loadStrictAsync();
    const noteCreator = creatorResult.isOk() ? creatorResult.value : null;

    for(const manual of manualNotes.values()){
      await write(manual.day, current => {
        // 기다리는 동안 파일에 저장된 체크 상태와 본문이 더 최신이다.
        const arranged = new TaskDataNoteDep(current).restoreData(manual);
        // 직접 바꾼 노트에도 그 사이 바뀐 루틴(방금 만든 루틴 등)을 반영한다. 루틴 순서는 루틴 파일에 저장되어 있고
        // todo는 원래 자리로 돌아가므로 사용자가 바꾼 배치는 그대로다. 과거 노트는 그때의 기록이므로 병합하지 않는다.
        const isPast = manual.day.wholeDayDiff(Day.today()) < 0;
        return noteCreator && !isPast ? mergeNote(arranged, noteCreator) : arranged;
      });
    }

    if(creatorResult.isErr()){
      // 직접 바꾼 노트는 루틴과 무관한 사용자의 편집이므로 위에서 그대로 저장했다.
      const paths = creatorResult.error.map(f => f.path);
      console.error("[Daily Routine] Notes were not merged because some routine files could not be read.", creatorResult.error);
      new Notice(t("tasks.merge.notSynced", { paths: paths.join(", ") }));
      return false;
    }

    const days = (await noteRepository.loadBetween(Day.today(), Day.max()))
      .map(note => note.day)
      .filter(day => !manualNotes.has(day.format()));
    for(const day of days){
      await write(day, current => mergeNote(current, creatorResult.value));
    }
  } catch(e) {
    console.error("Failed to apply routine changes to notes.", e);
    new Notice(t("tasks.merge.applyFailed"));
    return false;
  }

  if(failedDays.length > 0){
    const days = failedDays.map(d => formatFullDate(Day.fromString(d))).join(", ");
    new Notice(t(failedDays.length === 1 ? "tasks.merge.noteFailed_one" : "tasks.merge.noteFailed_other", { count: formatNumber(failedDays.length), days }));
    return false;
  }
  return true;
}
