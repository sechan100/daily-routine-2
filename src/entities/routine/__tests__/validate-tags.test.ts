import { RoutineEntity } from "@entities/routine/domain/routine";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));


describe("RoutineEntity.validateTags", () => {
  it("앞의 '#'을 지우고 중복을 합친다", () => {
    expect(RoutineEntity.validateTags(["#a", " b ", "a"])._unsafeUnwrap()).toEqual(["a", "b"]);
  });

  it("오류는 화면 문구가 아니라 코드와 문제가 된 태그로 알린다", () => {
    expect(RoutineEntity.validateTags(["#"])._unsafeUnwrapErr()).toEqual({ code: "empty", tag: "" });
    expect(RoutineEntity.validateTags(["a%b"])._unsafeUnwrapErr()).toEqual({ code: "reserved-char", tag: "a%b" });
    expect(RoutineEntity.validateTags(["a b"])._unsafeUnwrapErr()).toEqual({ code: "whitespace", tag: "a b" });
    expect(RoutineEntity.validateTags([1])._unsafeUnwrapErr()).toEqual({ code: "not-string", tag: "1" });
  });

  it("frontmatter의 잘못된 태그는 영어 진단 문구로 알린다", () => {
    const base = {
      order: 0, group: "UNGROUPED", showOnCalendar: false, activeCriteria: "week",
      daysOfWeek: ["MON"], daysOfMonth: [1], intervalDays: 1, intervalStart: "2025-01-01", enabled: true,
    };
    expect(RoutineEntity.validateRoutineProperties({ ...base, tags: ["a%"] })._unsafeUnwrapErr())
      .toBe("Invalid property 'tags': reserved-char ('a%')");
  });
});
