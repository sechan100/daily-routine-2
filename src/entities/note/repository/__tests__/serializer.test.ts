import { RoutineNote, RoutineTask, TaskGroup, TodoTask } from "@entities/note/domain/note.type";
import { parseRoutineNote, serializeRoutineNote, writeTasksSection } from "@entities/note/repository/serializer";
import { Day } from "@shared/period/day";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
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


const roundTrip = (content: string) => writeTasksSection(content, parseRoutineNote(day(), content));

const nonEmptyLines = (content: string) => content.split(/\r?\n/).filter(l => l.trim() !== "").sort();


describe("serializer: 기존 노트의 출력은 그대로 유지된다", () => {
  const plain = [
    "# Tasks",
    "## UNGROUPED",
    '- [x] [[Workout]]%%{"type":"routine","soc":1}%%',
    '- [ ] Buy milk%%{"type":"todo","soc":0}%%',
    "## Morning",
    '- [f] [[Stretching]]%%{"type":"routine","soc":1,"tags":["health"]}%% #health',
    "## (Evening)",
    '- [ ] [[Reading]]%%{"type":"routine","soc":0}%%',
    "## Empty",
    "## UNGROUPED",
    '- [ ] Call mom%%{"type":"todo","soc":1}%%',
  ].join("\n");

  it("플러그인이 쓴 노트는 다시 직렬화해도 byte 단위로 같다", () => {
    expect(serializeRoutineNote(parseRoutineNote(day(), plain))).toBe(plain);
  });

  it("섹션 밖의 frontmatter와 다른 heading은 그대로 두고 섹션만 다시 쓴다", () => {
    const content = ["---", "tags: daily", "---", plain, "", "# Memo", "hello", ""].join("\n");
    expect(roundTrip(content)).toBe(content);
  });

  it("다른 노트로 섹션을 바꿔 쓰면 섹션만 바뀐다", () => {
    const content = ["---", "a: 1", "---", "# Tasks", "## UNGROUPED", '- [ ] Old%%{"type":"todo","soc":0}%%', "", "# Memo", "hello"].join("\n");
    const note: RoutineNote = { day: day(), children: [todoTask({ name: "New" })] };
    expect(writeTasksSection(content, note)).toBe(
      ["---", "a: 1", "---", "# Tasks", "## UNGROUPED", '- [ ] New%%{"type":"todo","soc":0}%%', "", "# Memo", "hello"].join("\n")
    );
  });

  it("'# Tasks' 섹션이 없으면 파일 끝에 섹션을 덧붙이고, 빈 파일이면 섹션만 쓴다", () => {
    const note: RoutineNote = { day: day(), children: [todoTask()] };
    const section = ["# Tasks", "## UNGROUPED", '- [ ] Buy milk%%{"type":"todo","soc":0}%%'].join("\n");
    expect(writeTasksSection("memo\n\n", note)).toBe(`memo\n\n${section}`);
    expect(writeTasksSection("", note)).toBe(section);
  });
});


describe("serializer: 이름에 '\\'와 '%'가 있어도 깨지지 않는다", () => {
  it("'\\'가 들어간 이름은 escape로 해석되지 않고 그대로 직렬화된다", () => {
    const note: RoutineNote = {
      day: day(),
      children: [
        todoTask({ name: "C:\\new\\temp" }),
        {
          elementType: "group",
          name: "G\\t1",
          isOpen: true,
          children: [routineTask({ name: "a\\\\b \\x41\\u0041" })],
        } as TaskGroup,
      ],
    };
    expect(serializeRoutineNote(note)).toBe([
      "# Tasks",
      "## UNGROUPED",
      '- [ ] C:\\new\\temp%%{"type":"todo","soc":0}%%',
      "## G\\t1",
      '- [ ] [[a\\\\b \\x41\\u0041]]%%{"type":"routine","soc":1}%%',
    ].join("\n"));
    expect(parseRoutineNote(day(), serializeRoutineNote(note))).toEqual(note);
  });

  it("'%'가 들어간 이름은 보존되고, 메타데이터 구분자와 겹치는 '%%'만 제거된다", () => {
    const note: RoutineNote = {
      day: day(),
      children: [
        todoTask({ name: "50% done" }),
        todoTask({ name: "100%" }),
        routineTask({ name: "%start", tags: ["x"] }),
      ],
    };
    expect(parseRoutineNote(day(), serializeRoutineNote(note))).toEqual(note);

    const sanitized = parseRoutineNote(day(), serializeRoutineNote({ day: day(), children: [todoTask({ name: "a%%b" })] }));
    expect(sanitized.children[0].name).toBe("ab");
  });
});


describe("serializer: CRLF 줄바꿈", () => {
  const lf = [
    "---",
    "a: 1",
    "---",
    "# Tasks",
    "## UNGROUPED",
    '- [x] [[Workout]]%%{"type":"routine","soc":1,"tags":["health"]}%% #health',
    "  - 3 sets",
    "## Morning",
    '- [ ] Buy milk%%{"type":"todo","soc":0}%%',
    "",
    "# Memo",
    "hello",
  ].join("\n");
  const crlf = lf.replace(/\n/g, "\r\n");

  it("CRLF로 저장된 노트도 LF 노트와 똑같이 파싱된다", () => {
    const parsed = parseRoutineNote(day(), crlf);
    expect(parsed).toEqual(parseRoutineNote(day(), lf));
    expect(parsed.children).toHaveLength(2);
    expect(parsed.children[0]).toEqual(routineTask({ state: "accomplished", tags: ["health"], body: ["  - 3 sets"] }));
  });

  it("CRLF 파일의 섹션을 바꿔 쓰면 CRLF를 유지하고 섹션 밖 내용을 보존한다", () => {
    expect(roundTrip(crlf)).toBe(crlf);

    const parsed = parseRoutineNote(day(), crlf);
    const changed: RoutineNote = { ...parsed, children: [todoTask({ name: "Only" })] };
    const written = writeTasksSection(crlf, changed);
    expect(written.replace(/\r\n/g, "")).not.toContain("\n");
    expect(written).toBe(writeTasksSection(lf, changed).replace(/\n/g, "\r\n"));
    expect(written).toContain("\r\n# Memo\r\nhello");
  });
});


describe("serializer: 섹션 안의 사용자 줄 보존", () => {
  const content = [
    "# Tasks",
    "Intro written by the user",
    "## UNGROUPED",
    '- [x] [[Workout]]%%{"type":"routine","soc":1}%%',
    "  - 3 sets of squats",
    "\t- nested with tab",
    "",
    "free text after a blank line",
    "### Notes",
    "note body",
    '- [ ] Buy milk%%{"type":"todo","soc":0,"tags":["errand"]}%% #errand',
    "## Morning",
    "> group description",
    '- [ ] [[Stretching]]%%{"type":"routine","soc":1}%%',
    "- [ ] plain checkbox without metadata",
    '- [ ] [[Broken]]%%{broken%%',
    "## (Empty with text)",
    "only text here",
    "",
    "# Memo",
    "hello",
  ].join("\n");

  it("parse → 쓰기를 거쳐도 섹션이 그대로 남는다", () => {
    expect(roundTrip(content)).toBe(content);
  });

  it("task 뒤의 줄은 그 task의 body로, 그룹 heading 뒤의 줄은 그룹의 body로 파싱된다", () => {
    const parsed = parseRoutineNote(day(), content);
    expect(parsed.children).toEqual([
      routineTask({
        state: "accomplished",
        body: ["  - 3 sets of squats", "\t- nested with tab", "", "free text after a blank line", "### Notes", "note body"],
      }),
      todoTask({ tags: ["errand"] }),
      {
        elementType: "group",
        name: "Morning",
        isOpen: true,
        body: ["> group description"],
        children: [
          routineTask({ name: "Stretching", body: ["- [ ] plain checkbox without metadata", '- [ ] [[Broken]]%%{broken%%'] }),
        ],
      },
      {
        elementType: "group",
        name: "Empty with text",
        isOpen: false,
        body: ["only text here"],
        children: [],
      },
    ]);
  });

  it("'### ' 같은 하위 heading은 그룹으로 파싱되지 않는다", () => {
    const parsed = parseRoutineNote(day(), content);
    const groupNames = parsed.children.filter(c => c.elementType === "group").map(c => c.name);
    expect(groupNames).toEqual(["Morning", "Empty with text"]);
  });

  it("빈 줄은 정리되지만 내용이 있는 줄은 하나도 사라지지 않는다", () => {
    const messy = [
      "# Tasks",
      "",
      "## UNGROUPED",
      "under ungrouped heading",
      '- [ ] A%%{"type":"todo","soc":0}%%',
      "",
      "",
      '- [ ] B%%{"type":"todo","soc":0}%%',
      "  - sub of B",
      "",
      "## Morning",
      '- [ ] [[C]]%%{"type":"routine","soc":1}%%',
      "",
    ].join("\n");
    const written = roundTrip(messy);
    expect(nonEmptyLines(written)).toEqual(nonEmptyLines(messy));
    expect(written).toBe([
      "# Tasks",
      "under ungrouped heading",
      "## UNGROUPED",
      '- [ ] A%%{"type":"todo","soc":0}%%',
      '- [ ] B%%{"type":"todo","soc":0}%%',
      "  - sub of B",
      "## Morning",
      '- [ ] [[C]]%%{"type":"routine","soc":1}%%',
      "",
    ].join("\n"));
    // 한 번 정리된 뒤에는 더 바뀌지 않는다.
    expect(roundTrip(written)).toBe(written);
  });

  it("body가 없는(undefined) 요소는 파일에 있던 같은 이름 요소의 body를 유지한다", () => {
    // 병합처럼 루틴으로부터 새로 만든 노트에는 body가 없다.
    const rebuilt: RoutineNote = {
      day: day(),
      children: [
        {
          elementType: "group",
          name: "Morning",
          isOpen: true,
          children: [routineTask({ name: "Stretching" })],
        } as TaskGroup,
        routineTask({ state: "accomplished" }),
        todoTask({ tags: ["errand"] }),
      ],
    };
    const written = writeTasksSection(content, rebuilt);
    const parsed = parseRoutineNote(day(), written);
    expect(parsed.children[0]).toMatchObject({ name: "Morning", body: ["> group description"] });
    expect((parsed.children[0] as TaskGroup).children[0].body).toEqual(["- [ ] plain checkbox without metadata", '- [ ] [[Broken]]%%{broken%%']);
    expect((parsed.children[1] as RoutineTask).body).toContain("### Notes");
    expect(written.startsWith("# Tasks\nIntro written by the user\n## Morning\n")).toBe(true);
  });

  it("body가 빈 배열인 요소는 body를 지운다", () => {
    const parsed = parseRoutineNote(day(), content);
    const cleared: RoutineNote = {
      ...parsed,
      children: parsed.children.map(c => c.name === "Workout" ? { ...c, body: [] } : c),
    };
    const written = writeTasksSection(content, cleared);
    expect(written).not.toContain("3 sets of squats");
    expect(written).toContain("> group description");
  });

  it("들여쓴 task 라인은 지금처럼 task로 파싱된다", () => {
    const parsed = parseRoutineNote(day(), [
      "# Tasks",
      "## UNGROUPED",
      '- [ ] A%%{"type":"todo","soc":0}%%',
      '  - [ ] B%%{"type":"todo","soc":0}%%',
    ].join("\n"));
    expect(parsed.children.map(c => c.name)).toEqual(["A", "B"]);
  });
});


describe("serializer: 겹치는 이름의 body는 물려주지 않는다", () => {
  const rebuiltBodiesOf = (content: string, rebuilt: RoutineNote) => {
    const parsed = parseRoutineNote(day(), writeTasksSection(content, rebuilt));
    return parsed.children.flatMap(el => el.elementType === "group" ? [el as TaskGroup, ...(el as TaskGroup).children] : [el])
      .map(el => [el.name, (el as RoutineTask).body ?? null]);
  };

  it("같은 이름의 루틴과 할 일은 각자의 body만 물려받는다", () => {
    const content = [
      "# Tasks",
      "## UNGROUPED",
      '- [ ] [[Read]]%%{"type":"routine","soc":1}%%',
      "  - chapter 3",
      '- [ ] Read%%{"type":"todo","soc":0}%%',
    ].join("\n");
    const rebuilt: RoutineNote = { day: day(), children: [routineTask({ name: "Read" }), todoTask({ name: "Read" })] };
    expect(rebuiltBodiesOf(content, rebuilt)).toEqual([["Read", ["  - chapter 3"]], ["Read", null]]);
  });

  it("지운 할 일의 body가 같은 이름의 루틴 아래에 되살아나지 않는다", () => {
    const content = [
      "# Tasks",
      "## UNGROUPED",
      '- [ ] [[Read]]%%{"type":"routine","soc":1}%%',
      '- [ ] Read%%{"type":"todo","soc":0}%%',
      "  - todo note",
    ].join("\n");
    const withoutTodo: RoutineNote = { day: day(), children: [routineTask({ name: "Read" })] };
    expect(writeTasksSection(content, withoutTodo)).not.toContain("todo note");
  });

  it("파일에서 같은 키가 여러 번 나오면(다른 그룹의 같은 이름 할 일, 중복 그룹) 물려주지 않는다", () => {
    const content = [
      "# Tasks",
      "## G1",
      '- [ ] X%%{"type":"todo","soc":0}%%',
      "  - x in G1",
      "## G2",
      "g2 first",
      '- [ ] X%%{"type":"todo","soc":0}%%',
      "## G2",
      "g2 second",
    ].join("\n");
    const rebuilt: RoutineNote = {
      day: day(),
      children: [
        { elementType: "group", name: "G1", isOpen: true, children: [todoTask({ name: "X" })] } as TaskGroup,
        { elementType: "group", name: "G2", isOpen: true, children: [] } as TaskGroup,
      ],
    };
    expect(rebuiltBodiesOf(content, rebuilt)).toEqual([["G1", null], ["X", null], ["G2", null]]);
  });

  it("note에서 같은 키가 여러 번 나오면 body를 복제하지 않는다", () => {
    const content = ["# Tasks", "## G1", '- [ ] X%%{"type":"todo","soc":0}%%', "  - only one"].join("\n");
    const rebuilt: RoutineNote = {
      day: day(),
      children: [
        { elementType: "group", name: "G1", isOpen: true, children: [todoTask({ name: "X" })] } as TaskGroup,
        { elementType: "group", name: "G2", isOpen: true, children: [todoTask({ name: "X" })] } as TaskGroup,
      ],
    };
    expect(writeTasksSection(content, rebuilt).match(/only one/g)).toBeNull();
  });
});


describe("serializer: 섹션 밖의 byte는 바뀌지 않는다", () => {
  const note: RoutineNote = { day: day(), children: [todoTask({ name: "New" })] };

  it("섹션 밖의 단독 '\\r'은 그대로 남는다", () => {
    const prefix = "---\ntitle: a\rb\n---\n";
    const suffix = "\n# Memo\nline\rwith CR\n";
    const written = writeTasksSection(`${prefix}# Tasks\n## UNGROUPED\n- [ ] Old%%{"type":"todo","soc":0}%%${suffix}`, note);
    expect(written).toBe(`${prefix}# Tasks\n## UNGROUPED\n- [ ] New%%{"type":"todo","soc":0}%%${suffix}`);
  });

  it("LF가 대부분인 파일은 섹션 밖의 CRLF를 그대로 두고 섹션만 LF로 쓴다", () => {
    const prefix = "---\r\na: 1\n---\n";
    const suffix = "\n# Memo\r\nhello\n";
    const written = writeTasksSection(`${prefix}# Tasks\r\n## UNGROUPED\r\n- [ ] Old%%{"type":"todo","soc":0}%%${suffix}`, note);
    expect(written).toBe(`${prefix}# Tasks\n## UNGROUPED\n- [ ] New%%{"type":"todo","soc":0}%%${suffix}`);
  });

  it("CRLF가 대부분인 파일은 섹션을 CRLF로 쓰고 섹션 밖은 그대로 둔다", () => {
    const prefix = "---\r\na: 1\r\n---\n";
    const suffix = "\r\n\r\n# Memo\r\nhello";
    const written = writeTasksSection(`${prefix}# Tasks\r\n## UNGROUPED\r\n- [ ] Old%%{"type":"todo","soc":0}%%${suffix}`, note);
    expect(written).toBe(`${prefix}# Tasks\r\n## UNGROUPED\r\n- [ ] New%%{"type":"todo","soc":0}%%${suffix}`);
  });

  it("다음 heading이 바로 오는 빈 CRLF 섹션도 그 줄바꿈을 섹션 밖에 둔다", () => {
    const written = writeTasksSection("# Tasks\r\n# Memo\r\nhello", note);
    expect(written).toBe('# Tasks\r\n## UNGROUPED\r\n- [ ] New%%{"type":"todo","soc":0}%%\r\n# Memo\r\nhello');
  });

  it("줄바꿈이 단독 '\\r'뿐인 파일은 섹션으로 보지 않고, 내용을 지우지 않는다", () => {
    const content = "# Tasks\r## UNGROUPED\rkeep me";
    expect(parseRoutineNote(day(), content).children).toEqual([]);
    expect(writeTasksSection(content, note).startsWith(content)).toBe(true);
  });

  it("섹션 끝의 긴 공백도 선형 시간에 처리한다", () => {
    const content = "# Tasks\n## UNGROUPED\n" + "\n".repeat(200000) + "x";
    const startedAt = Date.now();
    writeTasksSection(content, note);
    expect(Date.now() - startedAt).toBeLessThan(1000);
  });
});
