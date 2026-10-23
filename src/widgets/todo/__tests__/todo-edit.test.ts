import { RoutineNote, Task, TaskGroup, TodoTask } from "@entities/note/domain/note.type";
import { TaskEntity } from "@entities/note/domain/task";
import { Day } from "@shared/period/day";
import { addTodoToNote, editTodoInNote } from "@widgets/todo/todo-edit";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));
// barrel이 저장소(obsidian 의존)까지 끌고 오므로, 검증에 필요한 도메인 객체만 연결한다.
jest.mock("@entities/note", () => ({
  ...jest.requireActual("@entities/note/domain/note.type"),
  NoteEntity: jest.requireActual("@entities/note/domain/note").NoteEntity,
  TaskEntity: jest.requireActual("@entities/note/domain/task").TaskEntity,
}));

const todo = (name: string, extra: Partial<TodoTask> = {}): TodoTask => ({ ...TaskEntity.createTodoTask(name, false), ...extra });
const group = (name: string, children: Task[]): TaskGroup => ({ elementType: "group", name, children, isOpen: true });
const makeNote = (children: RoutineNote["children"]): RoutineNote => ({ day: Day.fromString("2025-01-01"), children });

describe("addTodoToNote", () => {
  it("노트 맨 앞에 추가하고 원본 노트는 바꾸지 않는다", () => {
    const note = makeNote([todo("a")]);
    const added = todo("b");
    const result = addTodoToNote(note, added)._unsafeUnwrap();
    expect(result.children.map(c => c.name)).toEqual(["b", "a"]);
    expect(note.children.map(c => c.name)).toEqual(["a"]);
  });

  it("그룹 안의 task와도 이름이 겹치면 거부한다", () => {
    const note = makeNote([group("g", [todo("a")])]);
    expect(addTodoToNote(note, todo("a")).isErr()).toBe(true);
  });
});

describe("editTodoInNote", () => {
  it("이름과 캘린더 표시만 바꾸고 나머지는 노트의 최신 값을 유지한다", () => {
    // 수정 화면을 여는 동안 파일에서는 이미 체크됐다.
    const note = makeNote([todo("a", { state: "accomplished", tags: ["t"] })]);
    const result = editTodoInNote(note, "a", { name: "b", showOnCalendar: true })._unsafeUnwrap();
    expect(result.children[0]).toMatchObject({ name: "b", showOnCalendar: true, state: "accomplished", tags: ["t"] });
    expect((note.children[0] as Task).name).toBe("a");
  });

  it("그룹 안의 todo도 수정한다", () => {
    const note = makeNote([group("g", [todo("a")])]);
    const result = editTodoInNote(note, "a", { name: "b", showOnCalendar: false })._unsafeUnwrap();
    expect((result.children[0] as TaskGroup).children[0].name).toBe("b");
  });

  it("새 이름이 다른 task와 겹치면 거부한다", () => {
    const note = makeNote([todo("a"), todo("b")]);
    expect(editTodoInNote(note, "a", { name: "b", showOnCalendar: false })._unsafeUnwrapErr()).toBe("duplicated");
  });

  it("이름을 바꾸지 않는 수정은 자기 자신과 겹치지 않는다", () => {
    const note = makeNote([todo("a")]);
    expect(editTodoInNote(note, "a", { name: "a", showOnCalendar: true }).isOk()).toBe(true);
  });

  it("그 사이 지워진 todo는 거부한다", () => {
    expect(editTodoInNote(makeNote([]), "a", { name: "b", showOnCalendar: false })._unsafeUnwrapErr()).toBe("not-found");
  });
});
