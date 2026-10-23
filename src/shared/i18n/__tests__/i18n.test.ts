import { Day, DayOfWeek } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { formatDayOfMonth, formatDayOfWeek, formatHeaderDate, formatMonthDayNumeric, formatMonthYear, formatPercent, formatRelativeDay, getUiLanguage, t } from "@shared/i18n";
import { setAppLanguageForTest } from "@shared/i18n/language";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

const day = Day.fromString("2026-10-23"); // 금요일

afterEach(() => setAppLanguageForTest(null));


describe("UI 언어", () => {
  it("한국어 계열이면 ko, 나머지는 en", () => {
    setAppLanguageForTest("ko");
    expect(getUiLanguage()).toBe("ko");
    for(const lang of ["en", "de", "ja", "zh-TW", "ar"]){
      setAppLanguageForTest(lang);
      expect(getUiLanguage()).toBe("en");
    }
  });

  it("t는 UI 언어의 문구를 돌려주고, {name}을 채운다", () => {
    setAppLanguageForTest("ko");
    expect(t("common.save")).toBe("저장");
    setAppLanguageForTest("de");
    expect(t("common.save")).toBe("Save");
  });
});


describe("날짜 포매터", () => {
  it("영어", () => {
    setAppLanguageForTest("en");
    expect(formatHeaderDate(day, false)).toBe("Fri, Oct 23");
    expect(formatMonthDayNumeric(day)).toBe("10/23");
    expect(formatMonthYear(new Month(day))).toBe("October 2026");
    expect(formatDayOfWeek(DayOfWeek.MON)).toBe("Mon");
    expect(formatRelativeDay(day, day)).toBe("Today");
    expect(formatRelativeDay(Day.fromString("2026-10-22"), day)).toBe("Yesterday");
    expect(formatPercent(0.666)).toBe("67%");
  });

  it("한국어", () => {
    setAppLanguageForTest("ko");
    expect(formatHeaderDate(day, false)).toBe("10월 23일 (금)");
    expect(formatMonthYear(new Month(day))).toBe("2026년 10월");
    expect(formatDayOfWeek(DayOfWeek.SUN)).toBe("일");
    expect(formatRelativeDay(Day.fromString("2026-10-24"), day)).toBe("내일");
  });

  it("날짜 숫자에는 언어별 접미사를 붙이지 않는다", () => {
    for(const lang of ["en", "ko", "ja", "zh"]){
      setAppLanguageForTest(lang);
      expect(formatDayOfMonth(day)).toBe("23");
    }
    // 숫자 체계(라틴/아랍-인도 숫자)는 언어 데이터(CLDR)를 따르고, 접미사만 없으면 된다.
    for(const lang of ["ar", "ar-EG", "fa"]){
      setAppLanguageForTest(lang);
      expect(formatDayOfMonth(day)).toMatch(/^[0-9٠-٩۰-۹]+$/);
    }
  });

  it("독일어는 일/월 순서로 쓴다", () => {
    setAppLanguageForTest("de");
    expect(formatMonthDayNumeric(day)).toBe("23.10.");
  });

  it("페르시아어·태국어도 양력으로 표기한다 (기본 달력이 양력이 아닌 언어)", () => {
    setAppLanguageForTest("fa");
    // 양력 10월(اکتبر). 페르시아력이었다면 'مهر'(7월)가 나온다.
    expect(formatMonthYear(new Month(day))).toContain("اکتبر");
    setAppLanguageForTest("th");
    expect(formatMonthYear(new Month(day))).toContain("2026");
  });

  it("알 수 없는 언어 코드는 영어로 표기한다", () => {
    setAppLanguageForTest("not a locale!!");
    expect(formatHeaderDate(day, true)).toBe("Fri, Oct 23, 2026");
  });
});


describe("오른쪽→왼쪽 앱에서의 영어 문구", () => {
  afterEach(() => document.body.classList.remove("mod-rtl"));

  it("문구는 왼쪽→오른쪽 격리로, 채우는 값은 방향 자동 격리로 감싼다", () => {
    setAppLanguageForTest("ar");
    document.body.classList.add("mod-rtl");
    const text = t("common.legacyNoteNameConflict", { paths: "رياضة.md" });
    expect(text.startsWith("⁦")).toBe(true);
    expect(text.endsWith("⁩")).toBe(true);
    expect(text).toContain("⁨رياضة.md⁩");
  });

  it("왼쪽→오른쪽 앱이나 한국어 문구는 그대로 둔다", () => {
    setAppLanguageForTest("en");
    expect(t("common.save")).toBe("Save");
    setAppLanguageForTest("ko");
    document.body.classList.add("mod-rtl");
    expect(t("common.save")).toBe("저장");
  });
});
