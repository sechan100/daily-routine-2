import { RoutineNote, RoutineTask, TaskGroup, TodoTask } from "@entities/note/domain/note.type";
import { parseRoutineNote, serializeRoutineNote } from "@entities/note/repository/serializer";
import { Day } from "@shared/period/day";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    isMondayStartOfWeek: jest.fn(() => true),
  },
}));

const day = () => Day.fromString("2025-01-15");

const routineTask = (partial?: Partial<RoutineTask>): RoutineTask => ({
  elementType: "task",
  taskType: "routine",
  name: "Workout",
  state: "un-checked",
  showOnCalendar: true,
  tags: [],
  ...partial,
});

const todoTask = (partial?: Partial<TodoTask>): TodoTask => ({
  elementType: "task",
  taskType: "todo",
  name: "Buy milk",
  state: "un-checked",
  showOnCalendar: false,
  tags: [],
  ...partial,
});


describe("serializer round-trip: 태그 없는 태스크 (하위 호환)", () => {
  it("태그가 없는 태스크는 구버전과 byte 단위로 동일하게 직렬화된다", () => {
    const note: RoutineNote = {
      day: day(),
      children: [
        routineTask({ state: "accomplished" }),
        todoTask(),
      ],
    };
    expect(serializeRoutineNote(note)).toBe([
      "# Tasks",
      "## UNGROUPED",
      '- [x] [[Workout]]%%{"type":"routine","soc":1}%%',
      '- [ ] Buy milk%%{"type":"todo","soc":0}%%',
    ].join("\n"));
  });

  it("직렬화한 노트를 다시 파싱하면 동일한 노트가 된다", () => {
    const group: TaskGroup = {
      elementType: "group",
      name: "Morning",
      isOpen: true,
      children: [routineTask({ name: "Stretching" })],
    };
    const note: RoutineNote = {
      day: day(),
      children: [group, routineTask(), todoTask({ state: "failed" })],
    };
    const parsed = parseRoutineNote(day(), serializeRoutineNote(note));
    expect(parsed).toEqual(note);
  });

  it("구버전 형식의 라인(메타데이터에 tags 없음)은 tags가 빈 배열로 파싱된다", () => {
    const content = [
      "# Tasks",
      "## UNGROUPED",
      '- [x] [[Workout]]%%{"type":"routine","soc":1}%%',
    ].join("\n");
    const parsed = parseRoutineNote(day(), content);
    expect(parsed.children).toHaveLength(1);
    expect(parsed.children[0]).toEqual(routineTask({ state: "accomplished" }));
  });
});


describe("serializer round-trip: 태그가 있는 태스크", () => {
  it("태그는 메타데이터 JSON과 인라인 태그로 함께 직렬화된다", () => {
    const note: RoutineNote = {
      day: day(),
      children: [routineTask({ tags: ["health", "fitness"] })],
    };
    expect(serializeRoutineNote(note)).toBe([
      "# Tasks",
      "## UNGROUPED",
      '- [ ] [[Workout]]%%{"type":"routine","soc":1,"tags":["health","fitness"]}%% #health #fitness',
    ].join("\n"));
  });

  it("태그가 있는 태스크는 round-trip시 태그가 보존된다", () => {
    const note: RoutineNote = {
      day: day(),
      children: [
        routineTask({ tags: ["health", "fitness"] }),
        todoTask({ tags: ["errand"] }),
        {
          elementType: "group",
          name: "Evening",
          isOpen: false,
          children: [routineTask({ name: "Reading", tags: ["book"] })],
        } as TaskGroup,
      ],
    };
    const parsed = parseRoutineNote(day(), serializeRoutineNote(note));
    expect(parsed).toEqual(note);
  });

  it("라인 형식을 깨뜨리는 문자(공백, '#', '%')가 포함된 태그는 제거되어 직렬화된다", () => {
    const note: RoutineNote = {
      day: day(),
      children: [routineTask({ tags: ["he#al th%", "ok"] })],
    };
    const serialized = serializeRoutineNote(note);
    expect(serialized).toContain('%%{"type":"routine","soc":1,"tags":["health","ok"]}%% #health #ok');
    const parsed = parseRoutineNote(day(), serialized);
    expect(parsed.children[0]).toEqual(routineTask({ tags: ["health", "ok"] }));
  });
});


describe("serializer: 손상된 태그 라인의 우아한 실패", () => {
  const parseLines = (...lines: string[]) => {
    const content = ["# Tasks", "## UNGROUPED", ...lines].join("\n");
    return parseRoutineNote(day(), content);
  };

  it("메타데이터 JSON이 손상된 태그 라인은 무시된다 (throw하지 않음)", () => {
    const parsed = parseLines('- [ ] [[Workout]]%%{broken%% #health');
    expect(parsed.children).toHaveLength(0);
  });

  it("인라인 태그 뒤에 임의의 텍스트가 붙은 라인은 무시된다", () => {
    const parsed = parseLines('- [ ] [[Workout]]%%{"type":"routine","soc":1}%% #health garbage');
    expect(parsed.children).toHaveLength(0);
  });

  it("메타데이터 없이 태그만 있는 라인은 무시된다", () => {
    const parsed = parseLines("- [ ] plain text #health");
    expect(parsed.children).toHaveLength(0);
  });

  it("메타데이터의 tags가 배열이 아니면 빈 배열로 처리된다", () => {
    const parsed = parseLines('- [ ] [[Workout]]%%{"type":"routine","soc":1,"tags":"health"}%%');
    expect(parsed.children).toHaveLength(1);
    expect((parsed.children[0] as RoutineTask).tags).toEqual([]);
  });

  it("손상된 라인이 있어도 정상 라인은 계속 파싱된다", () => {
    const parsed = parseLines(
      '- [ ] [[Workout]]%%{broken%% #health',
      '- [ ] [[Reading]]%%{"type":"routine","soc":1,"tags":["book"]}%% #book',
    );
    expect(parsed.children).toHaveLength(1);
    expect(parsed.children[0]).toEqual(routineTask({ name: "Reading", tags: ["book"] }));
  });
});
