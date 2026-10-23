import { resolveFolderPath, toFolderPathSetting } from "../folder-path";

// Obsidian의 normalizePath처럼 앞뒤 '/'를 지우고, 남는 것이 없으면 "/"를 돌려준다.
jest.mock("obsidian", () => ({
  normalizePath: (path: string) => path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "") || "/",
}));


describe("toFolderPathSetting", () => {
  test.each([
    ["", "daily_routine"],
    ["   ", "daily_routine"],
    ["/", "daily_routine"],
    ["//", "daily_routine"],
    ["routine/", "routine"],
    [" my/routine ", "my/routine"],
  ])("'%s' -> '%s'", (input, expected) => {
    expect(toFolderPathSetting(input)).toBe(expected);
  });
});

describe("resolveFolderPath", () => {
  test("이전 버전에서 저장된 빈 값이나 '/'는 기본 폴더로 되돌린다", () => {
    expect(resolveFolderPath("")).toBe("daily_routine");
    expect(resolveFolderPath("/")).toBe("daily_routine");
    expect(resolveFolderPath(undefined)).toBe("daily_routine");
  });

  test("정상 경로는 그대로 쓴다", () => {
    expect(resolveFolderPath("my/routine")).toBe("my/routine");
  });
});
