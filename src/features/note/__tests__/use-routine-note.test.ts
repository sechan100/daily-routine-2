import { RoutineNote } from "@entities/note/domain/note.type";
import { Day } from "@shared/period/day";
import { resolveRoutineNote } from "@features/note/resolve-note";
import { initRoutineNoteStore } from "@features/note/use-routine-note";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));
jest.mock("obsidian", () => ({
  Notice: jest.fn(),
  moment: jest.requireActual("moment"),
}));
// 날짜의 노트를 읽는 일은 테스트가 원하는 순서로 끝낸다.
jest.mock("@features/note/resolve-note", () => ({ resolveRoutineNote: jest.fn() }));

const loads = new Map<string, { resolve: (note: RoutineNote) => void; reject: (e: unknown) => void }>();

beforeEach(() => {
  loads.clear();
  (resolveRoutineNote as jest.Mock).mockImplementation((day: Day) => new Promise<RoutineNote>((resolve, reject) => {
    loads.set(day.format(), { resolve, reject });
  }));
});

const A = "2025-01-15";
const B = "2025-01-16";
const C = "2025-01-17";
const note = (day: string, marker = ""): RoutineNote => ({
  day: Day.fromString(day),
  children: marker ? [{ elementType: "group", name: marker, children: [], isOpen: true } as RoutineNote["children"][number]] : [],
});
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

const setup = () => {
  const set = jest.fn();
  const store = initRoutineNoteStore(note(A), set);
  const shownNotes = () => set.mock.calls.map(([state]) => state.note as RoutineNote);
  return { store, set, shownNotes };
}


describe("useRoutineNote.setNote", () => {
  it("다른 날짜를 읽는 동안 도착한 이전 날짜의 노트는 날짜 이동을 취소하지 않는다", async () => {
    const { store, shownNotes } = setup();
    store.setNote(Day.fromString(B));
    // 예: 이전 날짜(A)에 대한 병합 결과나 파일 동기화가 늦게 도착한다.
    store.setNote(note(A, "late"));
    loads.get(B)?.resolve(note(B));
    await flush();

    expect(shownNotes().map(n => n.day.format())).toEqual([B]);
  });

  it("읽고 있는 날짜와 같은 날짜의 노트는 바로 반영하고, 늦게 끝난 읽기는 무시한다", async () => {
    const { store, shownNotes } = setup();
    store.setNote(Day.fromString(B));
    store.setNote(note(B, "fresh"));
    loads.get(B)?.resolve(note(B, "stale"));
    await flush();

    expect(shownNotes()).toEqual([note(B, "fresh")]);
  });

  it("읽는 중이 아니면 노트를 그대로 반영한다", () => {
    const { store, shownNotes } = setup();
    store.setNote(note(A, "x"));
    store.setNote(note(C, "y"));
    expect(shownNotes()).toEqual([note(A, "x"), note(C, "y")]);
  });

  it("마지막으로 요청한 날짜만 반영한다", async () => {
    const { store, shownNotes } = setup();
    store.setNote(Day.fromString(B));
    store.setNote(Day.fromString(C));
    loads.get(C)?.resolve(note(C));
    loads.get(B)?.resolve(note(B));
    await flush();

    expect(shownNotes().map(n => n.day.format())).toEqual([C]);
  });

  it("날짜를 읽지 못하면 다시 이전 날짜의 갱신을 받는다", async () => {
    const { store, shownNotes } = setup();
    store.setNote(Day.fromString(B));
    loads.get(B)?.reject(new Error("boom"));
    await flush();
    store.setNote(note(A, "after"));

    expect(shownNotes()).toEqual([note(A, "after")]);
  });
});
