import { INVALID_TITLE_CHARS_TEXT, validateObsidianFileTitle } from "@shared/utils/validate-obsidian-file-title";


describe("validateObsidianFileTitle", () => {
  it("앞뒤 공백을 제거한 제목을 반환한다", () => {
    const result = validateObsidianFileTitle("  morning run  ");
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe("morning run");
  });

  it("내부 공백과 비ASCII 문자는 허용한다", () => {
    expect(validateObsidianFileTitle("아침 운동 30분")._unsafeUnwrap()).toBe("아침 운동 30분");
  });

  it.each(["", "   ", "\t"])("빈 제목 %j 은 'empty'", (title) => {
    expect(validateObsidianFileTitle(title)._unsafeUnwrapErr()).toBe("empty");
  });

  it.each([":", "/", "\\", "#", "[", "]", "|", "^", "*", '"', "<", ">", "?"])(
    "문자 %s 가 포함되면 'contains-invalid-characters'",
    (ch) => {
      expect(validateObsidianFileTitle(`a${ch}b`)._unsafeUnwrapErr()).toBe("contains-invalid-characters");
    }
  );

  it.each([".hidden", " .hidden", "trailing."])("'.'으로 시작하거나 끝나는 %j 는 'starts-or-ends-with-dot'", (title) => {
    expect(validateObsidianFileTitle(title)._unsafeUnwrapErr()).toBe("starts-or-ends-with-dot");
  });

  it("중간의 '.'은 허용한다", () => {
    expect(validateObsidianFileTitle("v1.2 release")._unsafeUnwrap()).toBe("v1.2 release");
  });

  it("사용자에게 안내하는 금지 문자 목록이 실제 검증과 같다", () => {
    const listed = INVALID_TITLE_CHARS_TEXT.split(" ");
    expect(listed).toHaveLength(13);
    for(const ch of listed){
      expect(validateObsidianFileTitle(`a${ch}b`)._unsafeUnwrapErr()).toBe("contains-invalid-characters");
    }
  });

  it.each(["_g_x", "  _g_x"])("그룹 파일 접두사 _g_ 로 시작하는 %j 는 'reserved-prefix'", (title) => {
    expect(validateObsidianFileTitle(title)._unsafeUnwrapErr()).toBe("reserved-prefix");
  });

  it("_g_ 가 중간에 있는 제목은 허용한다", () => {
    expect(validateObsidianFileTitle("x_g_y")._unsafeUnwrap()).toBe("x_g_y");
  });
});
