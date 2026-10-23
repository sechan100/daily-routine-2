import { NoteElement, RoutineNote, RoutineTask, TaskGroup, TodoTask } from "@entities/note/domain/note.type";
import { Routine, RoutineElement, RoutineGroup } from "@entities/routine/domain/routine-type";
import { ElementReorder, RoutineElementLookup } from "@features/task-el/model/reorder-elements";
import { Day } from "@shared/period/day";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));


const routineTask = (name: string): RoutineTask => ({
  elementType: "task",
  taskType: "routine",
  name,
  state: "un-checked",
  showOnCalendar: false,
  tags: [],
});

const todoTask = (name: string): TodoTask => ({
  elementType: "task",
  taskType: "todo",
  name,
  state: "un-checked",
  showOnCalendar: false,
  tags: [],
});

const group = (name: string, children: RoutineTask[] = []): TaskGroup => ({
  elementType: "group",
  name,
  children,
  isOpen: true,
});

const note = (children: NoteElement[], day = "2026-10-23"): RoutineNote => ({
  day: Day.fromString(day),
  children,
});

// note 구조를 이름만으로 비교하기 위한 표현. group은 "name[child, ...]"
const layout = (n: RoutineNote): string[] => n.children.map(el => {
  return el.elementType === "group" ? `${el.name}[${(el as TaskGroup).children.map(t => t.name).join(",")}]` : el.name;
});

const routine = (name: string, order: number, groupName = "UNGROUPED"): Routine => ({
  routineElementType: "routine",
  name,
  properties: {
    order,
    group: groupName,
    showOnCalendar: false,
    activeCriteria: "week",
    daysOfWeek: [],
    daysOfMonth: [],
    intervalDays: 1,
    intervalStart: "2026-01-01",
    enabled: true,
    tags: [],
  },
});

const routineGroup = (name: string, order: number): RoutineGroup => ({
  routineElementType: "routine-group",
  name,
  properties: { order },
});

const lookupOf = (elements: RoutineElement[]): RoutineElementLookup => {
  return (name, type) => elements.find(e => e.name === name && e.routineElementType === type) ?? null;
};


describe("ElementReorder.move", () => {
  test("task를 다른 task의 위·아래로 옮긴다", () => {
    const n = note([routineTask("A"), routineTask("B"), routineTask("C")]);

    const top = ElementReorder.move(n, { dropped: routineTask("C"), on: routineTask("A"), hit: "top" })._unsafeUnwrap();
    expect(layout(top.note)).toEqual(["C", "A", "B"]);
    expect(top.parent).toBe(top.note);

    const bottom = ElementReorder.move(n, { dropped: routineTask("A"), on: routineTask("B"), hit: "bottom" })._unsafeUnwrap();
    expect(layout(bottom.note)).toEqual(["B", "A", "C"]);
  });

  test("원본 note와 group은 바꾸지 않는다", () => {
    const g = group("G", [routineTask("A"), routineTask("B")]);
    const n = note([g, routineTask("C")]);

    ElementReorder.move(n, { dropped: routineTask("C"), on: routineTask("A"), hit: "top" })._unsafeUnwrap();

    expect(layout(n)).toEqual(["G[A,B]", "C"]);
    expect(g.children.map(t => t.name)).toEqual(["A", "B"]);
  });

  test("group 안의 task 사이로 옮기면 그 group이 부모가 된다", () => {
    const n = note([group("G", [routineTask("A"), routineTask("B")]), routineTask("C")]);

    const moved = ElementReorder.move(n, { dropped: routineTask("C"), on: routineTask("B"), hit: "top" })._unsafeUnwrap();

    expect(layout(moved.note)).toEqual(["G[A,C,B]"]);
    expect(moved.parent).toBe(moved.note.children[0]);
  });

  test("빈 group 안으로 task를 넣는다", () => {
    const n = note([routineTask("A"), group("Empty"), group("Last")]);

    const moved = ElementReorder.move(n, { dropped: routineTask("A"), on: group("Empty"), hit: "in" })._unsafeUnwrap();

    expect(layout(moved.note)).toEqual(["Empty[A]", "Last[]"]);
    expect(moved.parent).toBe(moved.note.children[0]);
  });

  test("마지막 요소가 빈 group이어도 group 안의 task를 옮길 수 있다", () => {
    const n = note([group("G", [routineTask("A"), routineTask("B")]), group("Empty")]);

    const moved = ElementReorder.move(n, { dropped: routineTask("B"), on: routineTask("A"), hit: "top" })._unsafeUnwrap();

    expect(layout(moved.note)).toEqual(["G[B,A]", "Empty[]"]);
  });

  test("group의 마지막 task를 꺼내면 빈 group이 남는다", () => {
    const n = note([group("G", [routineTask("A")]), routineTask("B")]);

    const moved = ElementReorder.move(n, { dropped: routineTask("A"), on: routineTask("B"), hit: "bottom" })._unsafeUnwrap();

    expect(layout(moved.note)).toEqual(["G[]", "B", "A"]);
    expect(moved.parent).toBe(moved.note);
  });

  test("group을 빈 group 아래로 옮긴다", () => {
    const n = note([group("G", [routineTask("A")]), group("Empty")]);

    const moved = ElementReorder.move(n, { dropped: group("G"), on: group("Empty"), hit: "bottom" })._unsafeUnwrap();

    expect(layout(moved.note)).toEqual(["Empty[]", "G[A]"]);
  });

  test("같은 이름의 task와 group이 있어도 드래그한 쪽만 옮긴다", () => {
    const n = note([routineTask("Work"), group("Work", [routineTask("A")]), routineTask("B")]);

    const moved = ElementReorder.move(n, { dropped: group("Work"), on: routineTask("B"), hit: "bottom" })._unsafeUnwrap();

    expect(layout(moved.note)).toEqual(["Work", "B", "Work[A]"]);
  });

  test("group을 group 안의 task 옆에 놓거나, group 안으로 넣을 수 없다", () => {
    const n = note([group("G", [routineTask("A")]), group("H")]);

    expect(ElementReorder.move(n, { dropped: group("H"), on: routineTask("A"), hit: "top" }).isErr()).toBe(true);
    expect(ElementReorder.move(n, { dropped: group("H"), on: group("G"), hit: "in" }).isErr()).toBe(true);
  });

  test("자기 자신 위에 놓거나 note에 없는 요소는 err를 반환한다", () => {
    const n = note([routineTask("A"), routineTask("B")]);

    expect(ElementReorder.move(n, { dropped: routineTask("A"), on: routineTask("A"), hit: "top" }).isErr()).toBe(true);
    expect(ElementReorder.move(n, { dropped: routineTask("X"), on: routineTask("A"), hit: "top" }).isErr()).toBe(true);
    expect(ElementReorder.move(n, { dropped: routineTask("A"), on: routineTask("X"), hit: "top" }).isErr()).toBe(true);
  });
});


describe("ElementReorder.isPastDay", () => {
  test("날짜 단위로 비교한다 (오늘 노트는 현재 시각보다 이른 자정이어도 과거가 아니다)", () => {
    const now = Day.fromString("2026-10-23T15:30:00");
    expect(ElementReorder.isPastDay(Day.fromString("2026-10-23"), now)).toBe(false);
    expect(ElementReorder.isPastDay(Day.fromString("2026-10-22"), now)).toBe(true);
    expect(ElementReorder.isPastDay(Day.fromString("2026-10-24"), now)).toBe(false);
  });
});


describe("ElementReorder.resolveRoutineChanges", () => {
  const today = Day.fromString("2026-10-23T09:00:00");

  test("과거 노트의 순서 변경은 routine을 바꾸지 않는다", () => {
    const lookup = lookupOf([routine("A", 1000, "G"), routine("B", 2000), routineGroup("G", 1000)]);
    // 과거 노트에서 group G에 있던 A를 밖으로 꺼냈다.
    const past = note([routineTask("B"), routineTask("A"), group("G")], "2026-10-22");

    const changes = ElementReorder.resolveRoutineChanges({ day: past.day, today, parent: past, lookup });

    expect(changes).toEqual([]);
  });

  test("오늘 노트에서 위로 옮긴 요소 뒤의 요소들만 order를 밀어낸다", () => {
    const lookup = lookupOf([routine("A", 1000), routine("B", 2000), routine("C", 3000)]);
    const n = note([routineTask("C"), routineTask("A"), routineTask("B")]);

    const changes = ElementReorder.resolveRoutineChanges({ day: n.day, today, parent: n, lookup });

    expect(changes.map(c => [c.name, c.properties.order])).toEqual([["A", 4000], ["B", 5000]]);
  });

  test("이미 순서대로라면 아무것도 바꾸지 않는다", () => {
    const lookup = lookupOf([routine("A", 1000), routineGroup("G", 1500), routine("B", 2000)]);
    const n = note([routineTask("A"), group("G"), routineTask("B")]);

    expect(ElementReorder.resolveRoutineChanges({ day: n.day, today, parent: n, lookup })).toEqual([]);
  });

  test("group 안으로 옮긴 routine의 group을 바꾸고, lookup의 원본은 바꾸지 않는다", () => {
    const a = routine("A", 5000);
    const lookup = lookupOf([a, routine("B", 1000, "G"), routineGroup("G", 1000)]);
    const g = group("G", [routineTask("B"), routineTask("A")]);

    const changes = ElementReorder.resolveRoutineChanges({ day: today, today, parent: g, lookup });

    expect(changes).toEqual([{ ...a, properties: { ...a.properties, group: "G" } }]);
    expect(a.properties.group).toBe("UNGROUPED");
  });

  test("group 밖으로 꺼낸 routine은 UNGROUPED가 된다", () => {
    const lookup = lookupOf([routine("A", 2000, "G"), routineGroup("G", 1000)]);
    const n = note([group("G"), routineTask("A")]);

    const changes = ElementReorder.resolveRoutineChanges({ day: n.day, today, parent: n, lookup }) as Routine[];

    expect(changes.map(c => [c.name, c.properties.group])).toEqual([["A", "UNGROUPED"]]);
  });

  test("빈 group으로 옮긴 routine도 반영한다", () => {
    const lookup = lookupOf([routine("A", 1000), routineGroup("Empty", 2000)]);
    const g = group("Empty", [routineTask("A")]);

    const changes = ElementReorder.resolveRoutineChanges({ day: today, today, parent: g, lookup }) as Routine[];

    expect(changes.map(c => [c.name, c.properties.group, c.properties.order])).toEqual([["A", "Empty", 1000]]);
  });

  test("todo와 지금은 없는 routine·group은 건너뛴다", () => {
    const lookup = lookupOf([routine("A", 1000), routine("B", 500)]);
    const n = note([routineTask("A"), todoTask("Todo"), routineTask("Deleted"), group("Gone"), routineTask("B")]);

    const changes = ElementReorder.resolveRoutineChanges({ day: n.day, today, parent: n, lookup });

    expect(changes.map(c => [c.name, c.properties.order])).toEqual([["B", 2000]]);
  });

  test("지금은 없는 group 안으로의 이동은 routine에 반영하지 않는다", () => {
    const lookup = lookupOf([routine("A", 1000)]);
    const g = group("Gone", [routineTask("A")]);

    expect(ElementReorder.resolveRoutineChanges({ day: today, today, parent: g, lookup })).toEqual([]);
  });

  test("미래 노트의 순서 변경은 routine에 반영한다", () => {
    const lookup = lookupOf([routine("A", 1000), routine("B", 2000)]);
    const future = note([routineTask("B"), routineTask("A")], "2026-10-30");

    const changes = ElementReorder.resolveRoutineChanges({ day: future.day, today, parent: future, lookup });

    expect(changes.map(c => [c.name, c.properties.order])).toEqual([["A", 3000]]);
  });
});
