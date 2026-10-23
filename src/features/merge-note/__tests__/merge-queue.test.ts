import { NoteEntity, RoutineNote, RoutineTask, Task, TaskGroup, TodoTask } from "@entities/note";
import { groupRepository, Routine, RoutineGroup, RoutineProperties, routineRepository } from "@entities/routine";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { Day, DayOfWeek } from "@shared/period/day";
import { Notice } from "obsidian";
import { setAppLanguageForTest } from "@shared/i18n/language";
import { changeGroupName } from "@widgets/task-group/change-group-name";
import { NoteView, requestNotesMerge, runExclusiveWithMerges } from "../merge-queue";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));
// change-group-name이 불러오는 훅 모듈이 설정 탭(obsidian UI 클래스)까지 불러오지 않도록 한다.
jest.mock("@shared/utils/plugin-service-locator", () => ({ plugin: jest.fn() }));
jest.mock("obsidian", () => ({
  Notice: jest.fn(),
  moment: jest.requireActual("moment"),
}));

/**
 * vault 대신 메모리에 노트를 둔다. updateWith는 실제 구현처럼 쓰는 순간의 노트에 mutate를 적용한다.
 */
const files = new Map<string, RoutineNote>();
const hooks: {
  // updateWith가 파일을 읽기 직전에 기다릴 Promise (병합이 실행 중인 상태를 만들기 위함)
  beforeUpdate?: (day: Day) => Promise<void>;
  // loadBetween이 노트를 읽은 직후에 실행할 일 (그 사이에 사용자가 체크하는 상황)
  afterLoad?: () => void;
} = {};

jest.mock("@entities/note/repository/note-repository", () => ({
  noteRepository: {
    loadBetween: jest.fn(async (start: Day, end: Day) => {
      const notes = [...files.values()].filter(n => n.day.isBetween(start, end, "day", "[]"));
      hooks.afterLoad?.();
      return notes;
    }),
    updateWith: jest.fn(async (day: Day, mutate: (current: RoutineNote) => RoutineNote) => {
      await hooks.beforeUpdate?.(day);
      const current = files.get(day.format());
      if(!current) return null;
      const next = mutate(current);
      files.set(day.format(), next);
      return next;
    }),
  },
}));
jest.mock("@entities/routine/repository/routine-repository", () => ({
  routineRepository: { loadAll: jest.fn(), loadAllSettled: jest.fn(), updateAll: jest.fn() },
}));
jest.mock("@entities/routine/repository/group-repository", () => ({
  groupRepository: { loadAll: jest.fn(), loadAllSettled: jest.fn(), changeName: jest.fn() },
}));

// obsidian이 런타임에 확장하는 Array.prototype 메서드를 테스트 환경에서 재현한다.
beforeAll(() => {
  Array.prototype.contains = function <T>(this: T[], target: T): boolean {
    return this.indexOf(target) > -1;
  };
  Array.prototype.remove = function <T>(this: T[], target: T): void {
    let index = this.indexOf(target);
    while (index > -1) {
      this.splice(index, 1);
      index = this.indexOf(target);
    }
  };
});

let routines: Routine[] = [];
let groups: RoutineGroup[] = [];
// 읽지 못한 그룹 파일
let groupFailures: { path: string; message: string }[] = [];

beforeEach(() => {
  files.clear();
  delete hooks.beforeUpdate;
  delete hooks.afterLoad;
  routines = [];
  groups = [];
  groupFailures = [];
  (Notice as unknown as jest.Mock).mockClear();
  (routineRepository.loadAll as jest.Mock).mockImplementation(async () => routines);
  (routineRepository.loadAllSettled as jest.Mock).mockImplementation(async () => ({ items: routines, failures: [] }));
  (routineRepository.updateAll as jest.Mock).mockImplementation(async (updated: Routine[]) => {
    routines = routines.map(r => updated.find(u => u.name === r.name) ?? r);
    return updated;
  });
  (groupRepository.loadAll as jest.Mock).mockImplementation(async () => groups);
  (groupRepository.loadAllSettled as jest.Mock).mockImplementation(async () => ({ items: groups, failures: groupFailures }));
  (groupRepository.changeName as jest.Mock).mockImplementation(async (oldName: string, newName: string) => {
    groups = groups.map(g => g.name === oldName ? { ...g, name: newName } : g);
  });
});


const routine = (name: string, order: number, props?: Partial<RoutineProperties>): Routine => ({
  name,
  routineElementType: "routine",
  properties: {
    order,
    group: "UNGROUPED",
    showOnCalendar: false,
    activeCriteria: "week",
    daysOfWeek: Object.values(DayOfWeek),
    daysOfMonth: [],
    intervalDays: 1,
    intervalStart: "2025-01-01",
    enabled: true,
    tags: [],
    ...props,
  },
});

const rTask = (name: string, partial?: Partial<RoutineTask>): RoutineTask => ({
  elementType: "task",
  taskType: "routine",
  name,
  state: "un-checked",
  showOnCalendar: false,
  tags: [],
  ...partial,
});

const todo = (name: string): TodoTask => ({
  elementType: "task",
  taskType: "todo",
  name,
  state: "un-checked",
  showOnCalendar: false,
  tags: [],
});

const tGroup = (name: string, children: Task[]): TaskGroup => ({ elementType: "group", name, children, isOpen: true });

const today = () => Day.today();
const tomorrow = () => Day.today().clone(m => m.add(1, "day"));
const yesterday = () => Day.today().clone(m => m.subtract(1, "day"));

const putNote = (day: Day, children: RoutineNote["children"]) => files.set(day.format(), { day, children });
const fileOf = (day: Day) => files.get(day.format()) as RoutineNote;

const viewOf = (day: Day) => {
  let viewed: RoutineNote = { day, children: [] };
  const setNote = jest.fn((note: RoutineNote) => { viewed = note; });
  const view: NoteView = { getNote: () => viewed, setNote };
  return { view, setNote, viewed: () => viewed };
}

const deferred = () => {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>(r => { resolve = r; });
  return { promise, resolve };
}


describe("requestNotesMerge: 병합 중 다른 쓰기", () => {
  it("노트를 읽은 뒤 저장하기 전에 사용자가 체크한 상태를 덮어쓰지 않는다", async () => {
    routines = [routine("a", 0), routine("b", 1)];
    putNote(today(), [rTask("a")]);
    hooks.afterLoad = () => putNote(today(), [rTask("a", { state: "accomplished" })]);

    await requestNotesMerge(viewOf(today()).view);

    expect(fileOf(today()).children).toEqual([rTask("a", { state: "accomplished" }), rTask("b")]);
  });
});


describe("requestNotesMerge: 큐", () => {
  it("실행 중인 병합이 끝난 뒤에 다음 병합을 시작하고, 그 사이의 요청들은 한 번으로 합친다", async () => {
    routines = [routine("a", 0)];
    putNote(today(), []);
    putNote(tomorrow(), []);
    const gate = deferred();
    const writing = deferred();
    hooks.beforeUpdate = () => { writing.resolve(); return gate.promise; };
    const loadCreator = jest.spyOn(RoutineNoteCreator, "loadStrictAsync");

    const { view } = viewOf(yesterday());
    const first = requestNotesMerge(view);
    await writing.promise;
    // 첫 병합이 쓰기를 기다리는 동안 루틴이 바뀌고 두 번 더 요청된다.
    routines = [routine("a", 0), routine("b", 1)];
    const second = requestNotesMerge(view);
    const third = requestNotesMerge(view);
    expect(third).toBe(second);

    gate.resolve();
    await Promise.all([first, second, third]);

    expect(loadCreator).toHaveBeenCalledTimes(2);
    // 마지막에 쓴 결과는 최신 루틴 목록으로 계산한 것이다.
    expect(fileOf(today()).children).toEqual([rTask("a"), rTask("b")]);
    expect(fileOf(tomorrow()).children).toEqual([rTask("a"), rTask("b")]);
    loadCreator.mockRestore();
  });

  it("병합 큐의 단독 작업은 실행 중인 병합이 끝난 뒤에 실행되고, 그 뒤의 요청은 작업 이후에 병합한다", async () => {
    routines = [routine("a", 0)];
    putNote(today(), []);
    const gate = deferred();
    hooks.beforeUpdate = () => gate.promise;
    const order: string[] = [];

    const { view } = viewOf(yesterday());
    const first = requestNotesMerge(view).then(() => order.push("merge-1"));
    const job = runExclusiveWithMerges(async () => { order.push("job"); });
    const second = requestNotesMerge(view).then(() => order.push("merge-2"));

    gate.resolve();
    await Promise.all([first, job, second]);
    expect(order).toEqual(["merge-1", "job", "merge-2"]);
  });

  it("병합이 실패해도 reject하지 않고 다음 병합은 실행된다", async () => {
    putNote(today(), []);
    (routineRepository.loadAllSettled as jest.Mock).mockRejectedValueOnce(new Error("boom"));
    const { view } = viewOf(yesterday());
    await expect(requestNotesMerge(view)).resolves.toBe(false);

    routines = [routine("a", 0)];
    await requestNotesMerge(view);
    expect(fileOf(today()).children).toEqual([rTask("a")]);
  });
});


describe("requestNotesMerge: 화면 반영", () => {
  it("보고 있는 날짜의 병합 결과만 화면에 반영한다", async () => {
    routines = [routine("a", 0)];
    putNote(today(), []);
    putNote(tomorrow(), []);
    const { view, setNote } = viewOf(tomorrow());

    await requestNotesMerge(view);

    expect(setNote).toHaveBeenCalledTimes(1);
    expect(setNote.mock.calls[0][0].day.isSameDay(tomorrow())).toBe(true);
    expect(setNote.mock.calls[0][0].children).toEqual([rTask("a")]);
  });

  it("직접 바꾼 노트는 바로 화면에 반영하고, 그 배치를 유지한 채 저장한다", async () => {
    // DnD는 바뀐 루틴 순서를 루틴 파일에 먼저 저장한 뒤 병합을 요청한다.
    routines = [routine("b", 0), routine("a", 1)];
    putNote(today(), [rTask("a"), rTask("b")]);
    putNote(tomorrow(), []);
    const { view, setNote } = viewOf(today());
    const manual: RoutineNote = { day: today(), children: [rTask("b"), todo("t"), rTask("a")] };

    const done = requestNotesMerge(view, manual);
    expect(setNote).toHaveBeenCalledWith(manual);
    await done;

    expect(fileOf(today()).children).toEqual(manual.children);
    expect(fileOf(tomorrow()).children).toEqual([rTask("b"), rTask("a")]);
  });

  it("직접 바꾼 노트를 저장할 때, 기다리는 동안 파일에 저장된 체크 상태를 따른다", async () => {
    routines = [routine("b", 0), routine("a", 1)];
    putNote(today(), [rTask("a"), rTask("b")]);
    const manual: RoutineNote = { day: today(), children: [rTask("b"), rTask("a")] };
    putNote(today(), [rTask("a", { state: "failed" }), rTask("b")]);

    await requestNotesMerge(viewOf(today()).view, manual);

    expect(fileOf(today()).children).toEqual([rTask("b"), rTask("a", { state: "failed" })]);
  });

  it("직접 바꾼 노트에도 앞선 병합 뒤에 만든 루틴을 반영한다", async () => {
    routines = [routine("b", 0), routine("a", 1), routine("c", 2)];
    putNote(today(), [rTask("a"), rTask("b")]);
    const manual: RoutineNote = { day: today(), children: [rTask("b"), todo("t"), rTask("a")] };

    await requestNotesMerge(viewOf(today()).view, manual);

    expect(fileOf(today()).children).toEqual([rTask("b"), todo("t"), rTask("a"), rTask("c")]);
  });

  it("과거 노트를 직접 바꾼 경우에는 병합하지 않고 그대로 저장한다", async () => {
    routines = [routine("a", 0)];
    putNote(yesterday(), [rTask("a")]);
    const manual: RoutineNote = { day: yesterday(), children: [rTask("old"), rTask("a")] };

    await requestNotesMerge(viewOf(yesterday()).view, manual);

    expect(fileOf(yesterday()).children).toEqual([rTask("old"), rTask("a")]);
  });

  it("직접 바꾼 노트의 파일이 없으면 만들지 않는다", async () => {
    const manual: RoutineNote = { day: yesterday(), children: [rTask("a")] };
    await requestNotesMerge(viewOf(yesterday()).view, manual);
    expect(files.has(yesterday().format())).toBe(false);
  });
});


describe("changeGroupName", () => {
  it("그룹 이름을 바꾼 뒤 병합해도 그룹 안의 todo는 그 그룹에 남는다", async () => {
    groups = [{ name: "G", routineElementType: "routine-group", properties: { order: 0 } }];
    routines = [routine("a", 0, { group: "G" })];
    putNote(today(), [tGroup("G", [rTask("a"), todo("t")])]);
    putNote(tomorrow(), [tGroup("G", [todo("u"), rTask("a")])]);

    await changeGroupName("G", "H");
    await requestNotesMerge(viewOf(yesterday()).view);

    expect(fileOf(today()).children).toEqual([tGroup("H", [rTask("a"), todo("t")])]);
    expect(fileOf(tomorrow()).children).toEqual([tGroup("H", [todo("u"), rTask("a")])]);
  });

  it("과거 노트의 그룹 이름은 그때의 기록이므로 바꾸지 않는다", async () => {
    groups = [{ name: "G", routineElementType: "routine-group", properties: { order: 0 } }];
    putNote(yesterday(), [tGroup("G", [todo("t")])]);

    await changeGroupName("G", "H");

    expect(NoteEntity.findGroup(fileOf(yesterday()), "G")).not.toBeNull();
  });
});


describe("requestNotesMerge: 읽지 못한 루틴·그룹 파일", () => {
  const brokenGroup = { path: "routines/[G].md", message: "frontmatter error" };

  afterEach(() => setAppLanguageForTest(null));

  it("알림은 UI 언어를 따른다", async () => {
    routines = [routine("a", 0, { group: "G" })];
    groupFailures = [brokenGroup];
    putNote(today(), [tGroup("G", [rTask("a")])]);

    setAppLanguageForTest("ko");
    await requestNotesMerge(viewOf(today()).view);
    expect((Notice as unknown as jest.Mock).mock.calls[0][0]).toBe(
      `루틴 변경사항을 노트에 반영하지 못했습니다. 아래 파일을 고친 뒤 다시 시도해 주세요: ${brokenGroup.path}`
    );

    (Notice as unknown as jest.Mock).mockClear();
    setAppLanguageForTest("en");
    await requestNotesMerge(viewOf(today()).view);
    expect((Notice as unknown as jest.Mock).mock.calls[0][0]).toBe(
      `Notes were not synced with routines. Fix these files and try again: ${brokenGroup.path}`
    );
  });

  it("읽지 못한 파일이 있으면 노트를 하나도 다시 만들지 않고, 그 파일들을 한 번 알린다", async () => {
    // 그룹 G의 파일이 깨져 읽지 못했다. 이대로 병합하면 G와 그 본문이 지워지고 todo가 노트 맨 앞으로 밀려난다.
    routines = [routine("a", 0, { group: "G" })];
    groupFailures = [brokenGroup];
    const original = [tGroup("G", [rTask("a"), todo("t")])];
    putNote(today(), original);
    putNote(tomorrow(), original);

    await expect(requestNotesMerge(viewOf(today()).view)).resolves.toBe(false);

    expect(fileOf(today()).children).toEqual(original);
    expect(fileOf(tomorrow()).children).toEqual(original);
    expect(Notice).toHaveBeenCalledTimes(1);
    expect((Notice as unknown as jest.Mock).mock.calls[0][0]).toContain(brokenGroup.path);
  });

  it("읽지 못한 파일이 있어도 직접 바꾼 노트는 병합 없이 저장한다", async () => {
    groupFailures = [brokenGroup];
    putNote(today(), [rTask("a"), todo("t")]);
    const manual: RoutineNote = { day: today(), children: [todo("t"), rTask("a")] };

    await requestNotesMerge(viewOf(today()).view, manual);

    expect(fileOf(today()).children).toEqual(manual.children);
  });

  it("파일을 고친 뒤의 병합은 다시 노트를 만든다", async () => {
    routines = [routine("a", 0)];
    groupFailures = [brokenGroup];
    putNote(today(), []);
    await requestNotesMerge(viewOf(yesterday()).view);
    expect(fileOf(today()).children).toEqual([]);

    groupFailures = [];
    await expect(requestNotesMerge(viewOf(yesterday()).view)).resolves.toBe(true);
    expect(fileOf(today()).children).toEqual([rTask("a")]);
  });
});
