import { RoutineNote, Task } from "@entities/note/domain/note.type";
import { TaskEntity } from "@entities/note/domain/task";
import { Day } from "@shared/period/day";
import { setAppLanguageForTest } from "@shared/i18n/language";
import { routineNameErrorMessage, routineTagsErrorMessage, validateRoutineName } from "@widgets/routine/validate-routine-name";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));
// barrel이 저장소(obsidian 의존)까지 끌고 오므로, 검증에 필요한 도메인 객체만 연결한다.
jest.mock("@entities/note", () => ({
  NoteEntity: jest.requireActual("@entities/note/domain/note").NoteEntity,
}));
jest.mock("@entities/routine", () => ({
  RoutineEntity: jest.requireActual("@entities/routine/domain/routine").RoutineEntity,
}));

const makeNote = (todoNames: string[]): RoutineNote => ({
  day: Day.fromString("2025-01-01"),
  children: todoNames.map(name => TaskEntity.createTodoTask(name, false)),
});

describe("validateRoutineName", () => {
  it("공백을 제거한 이름을 반환한다", () => {
    expect(validateRoutineName("  run ", [], makeNote([]))._unsafeUnwrap()).toBe("run");
  });

  it("이미 있는 루틴 이름은 거부한다", () => {
    expect(validateRoutineName("run", ["run"], makeNote([]))._unsafeUnwrapErr()).toBe("duplicated");
  });

  it("지금 보는 노트의 todo와 같은 이름은 거부한다", () => {
    expect(validateRoutineName("buy milk", [], makeNote(["buy milk"]))._unsafeUnwrapErr()).toBe("duplicated-todo");
  });

  it("루틴 task는 todo가 아니므로 이름 충돌로 보지 않는다", () => {
    const routineTask: Task = { ...TaskEntity.createTodoTask("run", false), taskType: "routine" };
    const note: RoutineNote = { day: Day.fromString("2025-01-01"), children: [routineTask] };
    expect(validateRoutineName("run", [], note).isOk()).toBe(true);
  });

  it("파일 제목 규칙을 따른다", () => {
    expect(validateRoutineName("a/b", [], makeNote([]))._unsafeUnwrapErr()).toBe("contains-invalid-characters");
    expect(validateRoutineName("_g_x", [], makeNote([]))._unsafeUnwrapErr()).toBe("reserved-prefix");
  });
});


describe("routineNameErrorMessage", () => {
  afterEach(() => setAppLanguageForTest(null));

  it("영어", () => {
    setAppLanguageForTest("en");
    expect(routineNameErrorMessage("duplicated", "run")).toBe("Routine 'run' already exists.");
    expect(routineNameErrorMessage("contains-invalid-characters", "a/b")).toBe('Routine name cannot contain : / \\ # [ ] | ^ * " < > ?.');
    expect(routineNameErrorMessage("unknown", "x")).toBe("Invalid routine name.");
  });

  it("한국어 UI에서는 한국어 문구를 쓴다", () => {
    setAppLanguageForTest("ko");
    expect(routineNameErrorMessage("empty", "")).toBe("루틴 이름을 입력해 주세요.");
    expect(routineNameErrorMessage("duplicated", "운동")).toBe("'운동' 루틴이 이미 있습니다.");
    expect(routineNameErrorMessage("duplicated-todo", "운동")).toBe("이 노트에 '운동' 할 일이 이미 있습니다.");
    expect(routineNameErrorMessage("starts-or-ends-with-dot", ".")).toBe("루틴 이름은 마침표로 시작하거나 끝날 수 없습니다.");
    expect(routineNameErrorMessage("reserved-prefix", "_g_")).toBe("루틴 이름은 '_g_'로 시작할 수 없습니다.");
  });

  it("검증이 돌려주는 모든 오류 코드에 전용 문구가 있다", () => {
    setAppLanguageForTest("ko");
    const fallback = routineNameErrorMessage("unknown", "");
    for(const code of ["empty", "duplicated", "duplicated-todo", "contains-invalid-characters", "starts-or-ends-with-dot", "reserved-prefix"]){
      expect(routineNameErrorMessage(code, "x")).not.toBe(fallback);
    }
  });
});

describe("routineTagsErrorMessage", () => {
  afterEach(() => setAppLanguageForTest(null));

  it("태그 오류를 UI 언어로 보여준다", () => {
    setAppLanguageForTest("ko");
    expect(routineTagsErrorMessage({ code: "reserved-char", tag: "a%" })).toBe("태그에는 '%'를 쓸 수 없습니다.");
    expect(routineTagsErrorMessage({ code: "empty", tag: "" })).toBe("태그를 비워 둘 수 없습니다.");
    setAppLanguageForTest("en");
    expect(routineTagsErrorMessage({ code: "reserved-char", tag: "a%" })).toBe("Tags cannot contain '%'.");
  });
});
