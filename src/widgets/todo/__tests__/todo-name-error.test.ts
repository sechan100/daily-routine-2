import { setAppLanguageForTest } from "@shared/i18n/language";
import { todoNameErrorMessage } from "@widgets/todo/todo-name-error";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

afterEach(() => setAppLanguageForTest(null));


describe("todoNameErrorMessage", () => {
  it("영어", () => {
    setAppLanguageForTest("en");
    expect(todoNameErrorMessage("empty", "")).toBe("Todo name cannot be empty.");
    expect(todoNameErrorMessage("duplicated", "milk")).toBe("A task named 'milk' already exists in this note.");
    expect(todoNameErrorMessage("contains-comment-marker", "a%%")).toBe("Todo name cannot contain '%%'.");
  });

  it("한국어 UI에서는 한국어 문구를 쓴다", () => {
    setAppLanguageForTest("ko");
    expect(todoNameErrorMessage("empty", "")).toBe("할 일 이름을 입력해 주세요.");
    expect(todoNameErrorMessage("duplicated", "우유")).toBe("이 노트에 '우유' 항목이 이미 있습니다.");
    expect(todoNameErrorMessage("contains-link-brackets", "[[a]]")).toBe("할 일 이름에는 '[['나 ']]'를 쓸 수 없습니다.");
    expect(todoNameErrorMessage("not-found", "a")).toBe("이 할 일이 노트에 더 이상 없습니다.");
  });

  it("알 수 없는 코드는 일반 문구로 보여준다", () => {
    setAppLanguageForTest("ko");
    expect(todoNameErrorMessage("whatever", "a")).toBe("올바르지 않은 할 일 이름입니다.");
  });
});
