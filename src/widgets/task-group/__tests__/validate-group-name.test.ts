import { setAppLanguageForTest } from "@shared/i18n/language";
import { groupNameErrorMessage, validateGroupName } from "@widgets/task-group/validate-group-name";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));
// barrel이 저장소(obsidian 의존)까지 끌고 오므로, 검증에 필요한 도메인 객체만 연결한다.
jest.mock("@entities/routine", () => ({
  RoutineGroupEntity: jest.requireActual("@entities/routine/domain/routine-group").RoutineGroupEntity,
}));

afterEach(() => setAppLanguageForTest(null));


describe("validateGroupName", () => {
  it("오류 코드는 언어와 무관하다", () => {
    setAppLanguageForTest("ko");
    expect(validateGroupName("", [])._unsafeUnwrapErr()).toBe("empty");
    expect(validateGroupName("a", ["a"])._unsafeUnwrapErr()).toBe("duplicated");
    expect(validateGroupName("(a)", [])._unsafeUnwrapErr()).toBe("wrapped-in-parentheses");
    expect(validateGroupName("UNGROUPED2", [])._unsafeUnwrapErr()).toBe("reserved-name");
  });
});

describe("groupNameErrorMessage", () => {
  it("영어", () => {
    setAppLanguageForTest("en");
    expect(groupNameErrorMessage("duplicated", "work")).toBe("Group 'work' already exists.");
    expect(groupNameErrorMessage("wrapped-in-parentheses", "(a)")).toBe("Group name cannot be wrapped in parentheses.");
    expect(groupNameErrorMessage("reserved-name", "UNGROUPED")).toBe("Group name cannot be, or start with, 'UNGROUPED'.");
  });

  it("한국어 UI에서는 한국어 문구를 쓴다", () => {
    setAppLanguageForTest("ko");
    expect(groupNameErrorMessage("empty", "")).toBe("그룹 이름을 입력해 주세요.");
    expect(groupNameErrorMessage("duplicated", "업무")).toBe("'업무' 그룹이 이미 있습니다.");
    expect(groupNameErrorMessage("wrapped-in-parentheses", "(a)")).toBe("그룹 이름을 괄호로 감쌀 수 없습니다.");
    expect(groupNameErrorMessage("reserved-name", "UNGROUPED")).toBe("그룹 이름은 'UNGROUPED'로 시작할 수 없습니다.");
  });
});
