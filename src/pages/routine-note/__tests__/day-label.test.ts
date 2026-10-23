import { setAppLanguageForTest } from "@shared/i18n/language";
import { Day } from "@shared/period/day";
import { noteDateLabel, relativeDayLabel } from "../day-label";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

afterEach(() => setAppLanguageForTest(null));


describe("relativeDayLabel", () => {
  // 시각이 섞여 있어도 날짜 단위로만 비교해야 한다.
  const today = Day.fromString("2026-10-23T23:50:00");

  describe("영어", () => {
    beforeEach(() => setAppLanguageForTest("en"));

    test.each([
      ["2026-10-23", "Today"],
      ["2026-10-22", "Yesterday"],
      ["2026-10-24", "Tomorrow"],
      ["2026-10-20", "3 days ago"],
      ["2026-10-25", "In 2 days"],
      ["2025-10-23", "365 days ago"],
    ])("%s -> %s", (day, expected) => {
      expect(relativeDayLabel(Day.fromString(day), today)).toBe(expected);
    });
  });

  describe("한국어", () => {
    beforeEach(() => setAppLanguageForTest("ko"));

    test.each([
      ["2026-10-23", "오늘"],
      ["2026-10-22", "어제"],
      ["2026-10-24", "내일"],
      ["2026-10-20", "3일 전"],
      ["2026-10-26", "3일 후"],
    ])("%s -> %s", (day, expected) => {
      expect(relativeDayLabel(Day.fromString(day), today)).toBe(expected);
    });
  });
});

describe("noteDateLabel", () => {
  const today = Day.fromString("2026-10-23");

  describe("영어", () => {
    beforeEach(() => setAppLanguageForTest("en"));

    test("올해 날짜에는 연도를 붙이지 않는다", () => {
      expect(noteDateLabel(Day.fromString("2026-10-23"), today)).toBe("Fri, Oct 23");
    });

    test("다른 해의 날짜에는 연도를 붙인다", () => {
      expect(noteDateLabel(Day.fromString("2025-09-30"), today)).toBe("Tue, Sep 30, 2025");
    });
  });

  describe("한국어", () => {
    beforeEach(() => setAppLanguageForTest("ko"));

    test("올해 날짜에는 연도를 붙이지 않는다", () => {
      expect(noteDateLabel(Day.fromString("2026-10-23"), today)).toBe("10월 23일 (금)");
    });

    test("다른 해의 날짜에는 연도를 붙인다", () => {
      expect(noteDateLabel(Day.fromString("2025-09-30"), today)).toBe("2025년 9월 30일 (화)");
    });
  });
});
