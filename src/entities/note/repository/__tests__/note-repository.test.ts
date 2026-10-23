import { RoutineNote, TodoTask } from "@entities/note/domain/note.type";
import { noteRepository } from "@entities/note/repository/note-repository";
import { ensureArchive } from "@entities/archives";
import { fileAccessor } from "@shared/file/file-accessor";
import { Day } from "@shared/period/day";
import { TFile, TFolder } from "obsidian";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
    noteFolderPath: jest.fn(() => "dr/notes"),
  },
}));
jest.mock("@shared/components/modal/confirm-modal", () => ({ doConfirm: jest.fn() }));
jest.mock("@entities/archives", () => ({ ensureArchive: jest.fn() }));
jest.mock("@shared/file/file-accessor", () => ({
  fileAccessor: {
    loadFile: jest.fn(),
    loadFolder: jest.fn(),
    createFile: jest.fn(),
    createFolder: jest.fn(),
    writeFile: jest.fn(),
    readFileAsReadonly: jest.fn(),
    renameFileWithLinks: jest.fn(),
  },
}));

const day = Day.fromString("2025-01-15");
const PATH = "dr/notes/2025-01-15.md";

const todo = (name: string, partial?: Partial<TodoTask>): TodoTask => ({
  elementType: "task",
  taskType: "todo",
  name,
  state: "un-checked",
  showOnCalendar: false,
  tags: [],
  ...partial,
});

// vault를 대신하는 메모리 파일 저장소
const files = new Map<string, string>();
const fileAt = (path: string) => {
  const name = path.split("/").pop() ?? path;
  return Object.assign(new TFile(), { path, name, basename: name.replace(/\.md$/, ""), extension: "md" });
};
// 노트 폴더에 있는 파일들 (findLegacyNoteFile·loadBetween·이름 변경이 훑는다)
const notesFolder = () => Object.assign(new TFolder(), {
  children: [...files.keys()].filter(path => path.startsWith("dr/notes/")).map(fileAt),
});

const accessor = jest.mocked(fileAccessor);
const mockedEnsureArchive = jest.mocked(ensureArchive);

beforeEach(() => {
  jest.clearAllMocks();
  files.clear();
  accessor.loadFile.mockImplementation((path: string) => files.has(path) ? fileAt(path) : null);
  accessor.loadFolder.mockImplementation(() => notesFolder());
  accessor.readFileAsReadonly.mockImplementation(async (file: TFile) => files.get(file.path) ?? "");
  accessor.renameFileWithLinks.mockImplementation(async (file: TFile, newPath: string) => {
    files.set(newPath, files.get(file.path) ?? "");
    files.delete(file.path);
  });
  accessor.writeFile.mockImplementation(async (file: TFile, supplier: (data: string) => string) => {
    const next = supplier(files.get(file.path) ?? "");
    files.set(file.path, next);
    return next;
  });
  accessor.createFile.mockImplementation(async (path: string, content: string) => {
    if(files.has(path)) throw new Error("File already exists.");
    files.set(path, content);
    return fileAt(path);
  });
  mockedEnsureArchive.mockImplementation(async () => notesFolder());
});


describe("noteRepository.update", () => {
  it("CRLF 파일도 섹션을 찾아 바꿔 쓰고, 섹션 밖 내용과 CRLF를 유지한다", async () => {
    files.set(PATH, ["---", "a: 1", "---", "# Tasks", "## UNGROUPED", '- [ ] Old%%{"type":"todo","soc":0}%%', "", "# Memo", "hello"].join("\r\n"));
    await noteRepository.update({ day, children: [todo("New")] });
    expect(files.get(PATH)).toBe(
      ["---", "a: 1", "---", "# Tasks", "## UNGROUPED", '- [ ] New%%{"type":"todo","soc":0}%%', "", "# Memo", "hello"].join("\r\n")
    );
  });
});


describe("noteRepository.updateWith", () => {
  it("화면의 노트가 아니라 현재 파일 내용에 mutate를 적용하고 결과 노트를 반환한다", async () => {
    // 에디터에서 A를 직접 체크하고 하위 항목을 적어둔 상태
    files.set(PATH, [
      "# Tasks",
      "## UNGROUPED",
      '- [x] A%%{"type":"todo","soc":0}%%',
      "  - written in the editor",
      '- [ ] B%%{"type":"todo","soc":0}%%',
    ].join("\n"));

    const result = await noteRepository.updateWith(day, (current) => ({
      ...current,
      children: current.children.map(c => c.name === "B" ? { ...c, state: "accomplished" } : c),
    }));

    expect(files.get(PATH)).toBe([
      "# Tasks",
      "## UNGROUPED",
      '- [x] A%%{"type":"todo","soc":0}%%',
      "  - written in the editor",
      '- [x] B%%{"type":"todo","soc":0}%%',
    ].join("\n"));
    expect(result).toEqual<RoutineNote>({
      day,
      children: [
        todo("A", { state: "accomplished", body: ["  - written in the editor"] }),
        todo("B", { state: "accomplished" }),
      ],
    });
  });

  it("mutate가 아무것도 바꾸지 않으면 파일 내용을 바꾸지 않는다", async () => {
    const noSection = "just a memo\n";
    files.set(PATH, noSection);
    await noteRepository.updateWith(day, n => n);
    expect(files.get(PATH)).toBe(noSection);

    const messy = ["# Tasks", "", "## UNGROUPED", '- [ ] A%%{"type":"todo","soc":0}%%', "", "", '- [ ] B%%{"type":"todo","soc":0}%%'].join("\n");
    files.set(PATH, messy);
    const result = await noteRepository.updateWith(day, n => ({ ...n }));
    expect(files.get(PATH)).toBe(messy);
    expect(result?.children.map(c => c.name)).toEqual(["A", "B"]);
  });

  it("노트 파일이 없으면 쓰지 않고 null을 반환한다", async () => {
    const mutate = jest.fn((n: RoutineNote) => n);
    await expect(noteRepository.updateWith(day, mutate)).resolves.toBeNull();
    expect(mutate).not.toHaveBeenCalled();
    expect(accessor.writeFile).not.toHaveBeenCalled();
  });
});


describe("noteRepository.persist", () => {
  const note: RoutineNote = { day, children: [todo("A")] };

  it("노트가 없으면 만들고 true를 반환한다", async () => {
    await expect(noteRepository.persist(note)).resolves.toBe(true);
    expect(files.get(PATH)).toBe(["# Tasks", "## UNGROUPED", '- [ ] A%%{"type":"todo","soc":0}%%'].join("\n"));
  });

  it("이미 노트가 있으면 아무것도 하지 않고 false를 반환한다", async () => {
    files.set(PATH, "existing");
    await expect(noteRepository.persist(note)).resolves.toBe(false);
    expect(files.get(PATH)).toBe("existing");
    expect(accessor.createFile).not.toHaveBeenCalled();
  });

  it("생성이 겹쳐 그 사이 파일이 생겼으면 false를 반환한다", async () => {
    accessor.createFile.mockImplementationOnce(async (path: string) => {
      files.set(path, "created by the other call");
      throw new Error("File already exists.");
    });
    await expect(noteRepository.persist(note)).resolves.toBe(false);
    expect(files.get(PATH)).toBe("created by the other call");
  });

  it("그 외의 생성 실패는 폴더를 다시 만들려 하지 않고 원래 에러를 던진다", async () => {
    const error = new Error("Invalid path");
    accessor.createFile.mockRejectedValueOnce(error);
    await expect(noteRepository.persist(note)).rejects.toBe(error);
    expect(accessor.createFolder).not.toHaveBeenCalled();
    expect(mockedEnsureArchive).toHaveBeenCalledTimes(1);
  });

  it("폴더 생성이 겹쳐 실패해도 폴더가 생겼으면 노트를 만든다", async () => {
    mockedEnsureArchive.mockRejectedValueOnce(new Error("Folder already exists."));
    await expect(noteRepository.persist(note)).resolves.toBe(true);
  });

  it("폴더를 만들지 못했으면 원래 에러를 던진다", async () => {
    const error = new Error("Permission denied");
    mockedEnsureArchive.mockRejectedValueOnce(error);
    accessor.loadFolder.mockReturnValue(null);
    await expect(noteRepository.persist(note)).rejects.toBe(error);
    expect(accessor.createFile).not.toHaveBeenCalled();
  });
});


describe("이전 버전이 앱 언어의 숫자로 이름 붙인 노트 파일", () => {
  const LEGACY_PATH = "dr/notes/٢٠٢٥-٠١-١٥.md";
  const TASKS = ["# Tasks", "## UNGROUPED", '- [x] Legacy%%{"type":"todo","soc":0}%%'].join("\n");

  it("같은 날짜의 노트로 읽고, 그 파일에 저장한다", async () => {
    files.set(LEGACY_PATH, TASKS);
    const note = await noteRepository.load(day);
    expect(note?.children.map(c => c.name)).toEqual(["Legacy"]);

    await noteRepository.updateWith(day, n => ({ ...n, children: [...n.children, todo("New")] }));
    expect(files.has(PATH)).toBe(false);
    expect(files.get(LEGACY_PATH)).toContain("New");
  });

  it("기간으로 읽을 때도 포함하고, 같은 날짜의 새 파일이 있으면 새 파일을 쓴다", async () => {
    files.set(LEGACY_PATH, TASKS);
    let notes = await noteRepository.loadBetween(Day.fromString("2025-01-01"), Day.fromString("2025-01-31"));
    expect(notes.map(n => n.children.map(c => c.name))).toEqual([["Legacy"]]);

    files.set(PATH, ["# Tasks", "## UNGROUPED", '- [ ] Fresh%%{"type":"todo","soc":0}%%'].join("\n"));
    notes = await noteRepository.loadBetween(Day.fromString("2025-01-01"), Day.fromString("2025-01-31"));
    expect(notes.map(n => n.children.map(c => c.name))).toEqual([["Fresh"]]);
  });

  it("이름을 'YYYY-MM-DD.md'로 바꾸고, 같은 날짜의 새 파일이 있으면 그대로 두고 알린다", async () => {
    files.set(LEGACY_PATH, TASKS);
    files.set("dr/notes/۲۰۲۵-۰۱-۱۶.md", TASKS);
    files.set("dr/notes/2025-01-16.md", "# Tasks");
    files.set("dr/notes/memo.md", "not a note");

    const result = await noteRepository.migrateLegacyFileNames();
    expect(result).toEqual({ renamed: 1, conflicts: ["dr/notes/۲۰۲۵-۰۱-۱۶.md"] });
    expect(files.get(PATH)).toBe(TASKS);
    expect(files.has(LEGACY_PATH)).toBe(false);
    expect(files.has("dr/notes/memo.md")).toBe(true);
  });
});
