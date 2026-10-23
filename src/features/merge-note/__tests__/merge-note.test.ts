import { NoteEntity, RoutineNote, RoutineTask, Task, TaskGroup, TodoTask } from "@entities/note";
import { Routine, RoutineGroup, RoutineProperties } from "@entities/routine";
import { RoutineNoteCreator } from "@entities/routine-to-note/RoutineNoteCreator";
import { DayOfWeek, Day } from "@shared/period/day";
import { mergeNote } from "../merge-note";
import { renameGroupInNote, renameRoutineInNote } from "../rename-in-notes";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));
// 병합은 순수 함수이므로 vault에 닿는 저장소 모듈은 불러오지 않는다.
jest.mock("@entities/note/repository/note-repository", () => ({ noteRepository: {} }));
jest.mock("@entities/routine/repository/routine-repository", () => ({ routineRepository: {} }));
jest.mock("@entities/routine/repository/group-repository", () => ({ groupRepository: {} }));

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

const TODAY = "2025-01-15";
const today = () => Day.fromString(TODAY);

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

const group = (name: string, order: number): RoutineGroup => ({
  name,
  routineElementType: "routine-group",
  properties: { order },
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

const todo = (name: string, partial?: Partial<TodoTask>): TodoTask => ({
  elementType: "task",
  taskType: "todo",
  name,
  state: "un-checked",
  showOnCalendar: false,
  tags: [],
  ...partial,
});

const tGroup = (name: string, children: Task[], isOpen = true, body?: string[]): TaskGroup => ({
  elementType: "group",
  name,
  children,
  isOpen,
  ...(body ? { body } : {}),
});

const note = (day: string, children: RoutineNote["children"]): RoutineNote => ({
  day: Day.fromString(day),
  children,
});

const names = (els: { name: string }[]) => els.map(el => el.name);


describe("mergeNote: 변경이 없을 때", () => {
  it("루틴이 그대로면 병합 결과가 원래 노트와 같다 (todo 위치, 접힌 그룹, 체크 상태, 본문 포함)", () => {
    const creator = RoutineNoteCreator.with(
      [routine("a", 0), routine("b", 1, { group: "G" }), routine("c", 2, { group: "G" })],
      [group("G", 1)],
    );
    const original = note(TODAY, [
      rTask("a", { state: "accomplished", body: ["  - memo"] }),
      todo("t1", { state: "failed" }),
      tGroup("G", [rTask("b"), todo("t2", { body: ["  - sub"] }), rTask("c", { state: "accomplished" })], false, ["group memo"]),
      tGroup("Notes", [], true, ["free text"]),
    ]);
    const merged = mergeNote(original, creator, today());
    expect(merged.children).toEqual(original.children);
  });

  it("원래 노트를 바꾸지 않는다", () => {
    const creator = RoutineNoteCreator.with([routine("a", 0, { group: "G" }), routine("x", 1)], [group("G", 0)]);
    const original = note(TODAY, [
      tGroup("G", [rTask("a", { state: "failed" }), todo("t")], false),
      rTask("gone", { state: "accomplished" }),
      rTask("x"),
      todo("x"),
    ]);
    const snapshot = JSON.stringify(original.children);
    mergeNote(original, creator, today());
    expect(JSON.stringify(original.children)).toBe(snapshot);
  });
});


describe("mergeNote: 그룹 접힘 상태", () => {
  it("접어둔 그룹은 병합 후에도 접힌 상태를 유지한다", () => {
    const creator = RoutineNoteCreator.with([routine("a", 0, { group: "G" })], [group("G", 0), group("H", 1)]);
    const merged = mergeNote(note(TODAY, [tGroup("G", [rTask("a")], false)]), creator, today());
    expect(NoteEntity.findGroup(merged, "G")?.isOpen).toBe(false);
    // 원래 노트에 없던 그룹은 펼친 상태로 만든다.
    expect(NoteEntity.findGroup(merged, "H")?.isOpen).toBe(true);
  });
});


describe("mergeNote: task에 딸린 노트 데이터", () => {
  it("루틴 task의 체크 상태와 본문(body)을 복원한다", () => {
    const creator = RoutineNoteCreator.with([routine("a", 0), routine("b", 1)], []);
    const merged = mergeNote(note(TODAY, [
      rTask("a", { state: "failed", body: ["  - why"] }),
      rTask("b"),
    ]), creator, today());
    expect(NoteEntity.findTask(merged, "a")).toMatchObject({ state: "failed", body: ["  - why"] });
    expect(NoteEntity.findTask(merged, "b")?.body).toBeUndefined();
  });

  it("루틴에서 바뀐 태그는 반영하고, 체크 상태와 본문은 노트의 것을 유지한다", () => {
    const creator = RoutineNoteCreator.with([routine("a", 0, { tags: ["new"] })], []);
    const merged = mergeNote(note(TODAY, [
      rTask("a", { state: "accomplished", body: ["  - x"], tags: ["old"] }),
    ]), creator, today());
    expect(NoteEntity.findTask(merged, "a")).toMatchObject({ state: "accomplished", body: ["  - x"], tags: ["new"] });
  });

  it("todo의 체크 상태와 본문을 유지한다", () => {
    const creator = RoutineNoteCreator.with([routine("a", 0)], []);
    const merged = mergeNote(note(TODAY, [
      rTask("a"),
      todo("t", { state: "accomplished", body: ["  - y"] }),
    ]), creator, today());
    expect(NoteEntity.findTask(merged, "t")).toMatchObject({ taskType: "todo", state: "accomplished", body: ["  - y"] });
  });
});


describe("mergeNote: 오늘 완료한 루틴 기록", () => {
  // b가 오늘 체크된 뒤에 비활성화(또는 삭제, 일정 변경)된 상황
  const routinesWithoutB = () => RoutineNoteCreator.with([routine("a", 0), routine("c", 2)], []);

  it("오늘 노트: 체크한 루틴은 루틴이 사라져도 원래 자리에 남는다", () => {
    const merged = mergeNote(note(TODAY, [
      rTask("a"),
      rTask("b", { state: "accomplished" }),
      rTask("c"),
    ]), routinesWithoutB(), today());
    expect(names(merged.children)).toEqual(["a", "b", "c"]);
    expect(NoteEntity.findTask(merged, "b")?.state).toBe("accomplished");
  });

  it("오늘 노트: 실패로 표시한 루틴도 남는다", () => {
    const merged = mergeNote(note(TODAY, [
      rTask("b", { state: "failed" }),
      rTask("a"),
    ]), routinesWithoutB(), today());
    expect(names(merged.children)).toEqual(["b", "a", "c"]);
  });

  it("오늘 노트: 체크하지 않은 루틴은 루틴이 사라지면 함께 사라진다", () => {
    const merged = mergeNote(note(TODAY, [rTask("a"), rTask("b"), rTask("c")]), routinesWithoutB(), today());
    expect(names(merged.children)).toEqual(["a", "c"]);
  });

  it("오늘 노트: 체크하지 않았어도 본문(body)을 적어둔 루틴은 남는다", () => {
    const merged = mergeNote(note(TODAY, [rTask("a"), rTask("b", { body: ["  - memo"] }), rTask("c")]), routinesWithoutB(), today());
    expect(names(merged.children)).toEqual(["a", "b", "c"]);
  });

  it("과거 노트: 체크한 루틴은 남는다", () => {
    const merged = mergeNote(note("2025-01-14", [rTask("a"), rTask("b", { state: "accomplished" }), rTask("c")]), routinesWithoutB(), today());
    expect(names(merged.children)).toEqual(["a", "b", "c"]);
  });

  it("미래 노트: 체크한 루틴이라도 루틴이 사라지면 함께 사라진다", () => {
    const merged = mergeNote(note("2025-01-16", [rTask("a"), rTask("b", { state: "accomplished" }), rTask("c")]), routinesWithoutB(), today());
    expect(names(merged.children)).toEqual(["a", "c"]);
  });

  it("그룹 안에서 체크한 루틴은 그 그룹의 원래 자리에 남는다", () => {
    const creator = RoutineNoteCreator.with(
      [routine("a", 0, { group: "G" }), routine("c", 2, { group: "G" })],
      [group("G", 0)],
    );
    const merged = mergeNote(note(TODAY, [
      tGroup("G", [rTask("a"), rTask("b", { state: "accomplished" }), rTask("c")]),
    ]), creator, today());
    expect(names(NoteEntity.findGroup(merged, "G")?.children ?? [])).toEqual(["a", "b", "c"]);
  });

  it("연속으로 사라진 기록들도 원래 순서대로 남는다", () => {
    const creator = RoutineNoteCreator.with([routine("a", 0), routine("d", 3)], []);
    const merged = mergeNote(note(TODAY, [
      rTask("a"),
      rTask("b", { state: "accomplished" }),
      todo("t"),
      rTask("c", { state: "failed" }),
      rTask("d"),
    ]), creator, today());
    expect(names(merged.children)).toEqual(["a", "b", "t", "c", "d"]);
  });

  it("다른 그룹으로 옮겨진 루틴은 기록으로 남기지 않고 새 자리에서 상태만 복원한다", () => {
    const creator = RoutineNoteCreator.with([routine("a", 0), routine("b", 1, { group: "G" })], [group("G", 1)]);
    const merged = mergeNote(note(TODAY, [rTask("a"), rTask("b", { state: "accomplished" })]), creator, today());
    expect(names(merged.children)).toEqual(["a", "G"]);
    expect(NoteEntity.findGroup(merged, "G")?.children).toEqual([rTask("b", { state: "accomplished" })]);
  });
});


describe("mergeNote: 같은 이름의 todo와 루틴", () => {
  it("노트에 같은 이름의 todo와 루틴이 함께 있으면 todo만 남긴다", () => {
    const creator = RoutineNoteCreator.with([routine("x", 0), routine("a", 1)], []);
    const merged = mergeNote(note(TODAY, [
      rTask("x"),
      rTask("a"),
      todo("x", { state: "accomplished" }),
    ]), creator, today());
    const xs = NoteEntity.flatten(merged).filter(t => t.name === "x");
    expect(xs).toEqual([todo("x", { state: "accomplished" })]);
  });

  it("todo와 같은 이름의 루틴이 새로 생겨도 그 노트에서는 todo만 남긴다", () => {
    const creator = RoutineNoteCreator.with([routine("x", 0)], []);
    const merged = mergeNote(note("2025-01-16", [todo("x")]), creator, today());
    expect(merged.children).toEqual([todo("x")]);
  });
});


describe("renameGroupInNote", () => {
  it("그룹 이름을 바꾼 뒤 병합해도 그룹 안의 todo와 접힘 상태가 유지된다", () => {
    const creator = RoutineNoteCreator.with([routine("a", 0, { group: "H" })], [group("H", 0)]);
    const original = note(TODAY, [tGroup("G", [rTask("a"), todo("t")], false)]);
    const merged = mergeNote(renameGroupInNote(original, "G", "H"), creator, today());
    expect(merged.children).toEqual([tGroup("H", [rTask("a"), todo("t")], false)]);
  });

  it("원래 노트는 바꾸지 않는다", () => {
    const original = note(TODAY, [tGroup("G", [todo("t")])]);
    renameGroupInNote(original, "G", "H");
    expect(original.children[0].name).toBe("G");
  });
});


describe("renameRoutineInNote", () => {
  it("오늘 체크한 루틴의 이름을 바꾼 뒤 병합해도 기록이 새 이름의 task에 이어진다", () => {
    const creator = RoutineNoteCreator.with(
      [routine("a", 0), routine("B", 1, { group: "G" })],
      [group("G", 1)],
    );
    const original = note(TODAY, [
      rTask("a"),
      tGroup("G", [rTask("b", { state: "accomplished", body: ["  - memo"] })]),
    ]);
    const merged = mergeNote(renameRoutineInNote(original, "b", "B"), creator, today());
    expect(merged.children).toEqual([
      rTask("a"),
      tGroup("G", [rTask("B", { state: "accomplished", body: ["  - memo"] })]),
    ]);
  });

  it("같은 이름의 todo는 바꾸지 않는다", () => {
    const renamed = renameRoutineInNote(note(TODAY, [todo("b")]), "b", "B");
    expect(renamed.children).toEqual([todo("b")]);
  });
});



describe("mergeNote: 루틴 그룹이 아닌 그룹", () => {
  const creator = () => RoutineNoteCreator.with([routine("a", 0), routine("b", 1)], []);

  it("직접 쓴 그룹('## Notes')은 본문과 함께 원래 자리에 남는다", () => {
    const notes = tGroup("Notes", [], false, ["- idea", "  more"]);
    const merged = mergeNote(note(TODAY, [rTask("a"), notes, rTask("b")]), creator(), today());
    expect(merged.children).toEqual([rTask("a"), notes, rTask("b")]);
  });

  it("미래 노트에서도 본문이 있는 그룹은 남는다", () => {
    const notes = tGroup("Notes", [], true, ["plan"]);
    const merged = mergeNote(note("2025-01-16", [notes, rTask("a"), rTask("b")]), creator(), today());
    expect(merged.children).toEqual([notes, rTask("a"), rTask("b")]);
  });

  it("삭제된 그룹에 todo가 남아있으면 그룹째 남고, 루틴 task는 루틴의 새 자리를 따른다", () => {
    const merged = mergeNote(note(TODAY, [
      tGroup("Gone", [rTask("a"), todo("t")]),
      rTask("b"),
    ]), creator(), today());
    // 원래 맨 앞에 있던 그룹이므로 맨 앞에 남는다.
    expect(merged.children).toEqual([tGroup("Gone", [todo("t")]), rTask("a"), rTask("b")]);
  });

  it("오늘 노트: 삭제된 그룹에 체크한 루틴 기록이 있으면 그룹째 남는다", () => {
    const merged = mergeNote(note(TODAY, [
      rTask("a"),
      tGroup("Gone", [rTask("x", { state: "accomplished" }), rTask("y")]),
      rTask("b"),
    ]), creator(), today());
    expect(merged.children).toEqual([rTask("a"), tGroup("Gone", [rTask("x", { state: "accomplished" })]), rTask("b")]);
  });

  it("미래 노트: 체크한 루틴 기록만 있던 삭제된 그룹은 비게 되므로 지운다", () => {
    const merged = mergeNote(note("2025-01-16", [
      rTask("a"),
      tGroup("Gone", [rTask("x", { state: "accomplished" })]),
      rTask("b"),
    ]), creator(), today());
    expect(merged.children).toEqual([rTask("a"), rTask("b")]);
  });

  it("체크하지 않은 루틴만 있던 삭제된 그룹은 지운다", () => {
    const merged = mergeNote(note(TODAY, [tGroup("Gone", [rTask("x")]), rTask("a"), rTask("b")]), creator(), today());
    expect(merged.children).toEqual([rTask("a"), rTask("b")]);
  });

  it("같은 이름의 그룹이 둘 있던 노트는 하나로 합친다", () => {
    const merged = mergeNote(note(TODAY, [
      tGroup("N", [todo("t1")]),
      rTask("a"),
      tGroup("N", [todo("t2")]),
      rTask("b"),
    ]), creator(), today());
    expect(merged.children.filter(el => el.name === "N")).toHaveLength(1);
    expect(names(NoteEntity.findGroup(merged, "N")?.children ?? []).sort()).toEqual(["t1", "t2"]);
  });
});


describe("mergeNote: 루틴 그룹의 본문", () => {
  it("루틴 그룹 heading 아래에 적어둔 본문을 유지한다", () => {
    const creator = RoutineNoteCreator.with([routine("a", 0, { group: "G" })], [group("G", 0)]);
    const g = tGroup("G", [rTask("a")], true, ["memo"]);
    const merged = mergeNote(note("2025-01-16", [g]), creator, today());
    expect(merged.children).toEqual([g]);
  });
});
