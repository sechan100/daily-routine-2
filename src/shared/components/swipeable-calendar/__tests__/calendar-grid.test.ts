import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { DR_SETTING } from "@app/settings/setting-provider";
import { CALENDAR_TYPE_BY_WEEK_START, CALENDAR_WEEKDAYS_HEIGHT, countCalendarWeeks, getCalendarGridRange, layoutCalendarRows } from "@shared/components/swipeable-calendar/calendar-grid";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

const setMondayStart = (value: boolean) => {
  (DR_SETTING.weekStartDow as jest.Mock).mockReturnValue(value ? 1 : 0);
};

const month = (date: string) => new Month(Day.fromString(date));


describe("countCalendarWeeks", () => {
  it("월요일 시작: 1일이 일요일인 31일 달은 6주", () => {
    setMondayStart(true);
    // 2025-06-01은 일요일
    expect(countCalendarWeeks(month("2025-06-01"))).toBe(6);
  });

  it("일요일 시작: 같은 달은 5주", () => {
    setMondayStart(false);
    expect(countCalendarWeeks(month("2025-06-01"))).toBe(5);
  });

  it("토요일 시작: 1일이 토요일이면 그 주가 첫 행이다", () => {
    (DR_SETTING.weekStartDow as jest.Mock).mockReturnValue(6);
    // 2025-11-01은 토요일, 30일까지 → 5주
    expect(countCalendarWeeks(month("2025-11-01"))).toBe(5);
    // 2025-08-01은 금요일 → 첫 주가 7월 26일(토)부터 시작해 6주
    expect(countCalendarWeeks(month("2025-08-01"))).toBe(6);
  });

  it("1일이 주 시작 요일인 28일 2월은 4주", () => {
    setMondayStart(true);
    // 2021-02-01은 월요일
    expect(countCalendarWeeks(month("2021-02-01"))).toBe(4);
    setMondayStart(false);
    // 2015-02-01은 일요일
    expect(countCalendarWeeks(month("2015-02-01"))).toBe(4);
  });
});


describe("getCalendarGridRange", () => {
  it.each([
    // 2025-08-01은 금요일, 2025-08-31은 일요일
    ["월요일", 1, "2025-07-28", "2025-08-31"],
    ["일요일", 0, "2025-07-27", "2025-09-06"],
    ["토요일", 6, "2025-07-26", "2025-09-05"],
  ] as const)("%s 시작: 이웃한 달 날짜까지 포함해 주 단위로 맞춘다", (_label, start, first, last) => {
    (DR_SETTING.weekStartDow as jest.Mock).mockReturnValue(start);
    const range = getCalendarGridRange(month("2025-08-14"));
    expect(range.startDay.format()).toBe(first);
    expect(range.endDay.format()).toBe(last);
    // 칸 수는 행 수 계산과 같다.
    expect(range.endDay.wholeDayDiff(range.startDay) + 1).toBe(countCalendarWeeks(month("2025-08-14")) * 7);
    expect(range.startDay.dow).toBe(Day.getDaysOfWeek()[0]);
    expect(range.endDay.dow).toBe(Day.getDaysOfWeek()[6]);
  });

  it("1일이 주 시작 요일이면 앞쪽 이웃한 달 날짜가 없다", () => {
    (DR_SETTING.weekStartDow as jest.Mock).mockReturnValue(6);
    // 2025-11-01은 토요일
    expect(getCalendarGridRange(month("2025-11-01")).startDay.format()).toBe("2025-11-01");
  });
});


describe("CALENDAR_TYPE_BY_WEEK_START", () => {
  it("주 시작 요일 설정(0 일, 1 월, 6 토)마다 react-calendar의 calendarType이 있다", () => {
    expect(CALENDAR_TYPE_BY_WEEK_START).toEqual({ 0: "gregory", 1: "iso8601", 6: "islamic" });
  });
});


describe("layoutCalendarRows", () => {
  it("요일 행과 reserved를 뺀 높이를 주 수로 나눈다", () => {
    const slideHeight = CALENDAR_WEEKDAYS_HEIGHT + 40 + 6 * 70;
    expect(layoutCalendarRows({ slideHeight, rows: 6, minRowHeight: 50, reserved: 40 })).toEqual({ rowHeight: 70, scroll: false });
    expect(layoutCalendarRows({ slideHeight, rows: 5, minRowHeight: 50, reserved: 40 })).toEqual({ rowHeight: 84, scroll: false });
  });

  it("최소 높이보다 작아지면 최소 높이를 쓰고 스크롤로 넘긴다", () => {
    expect(layoutCalendarRows({ slideHeight: 200, rows: 6, minRowHeight: 50 })).toEqual({ rowHeight: 50, scroll: true });
    expect(layoutCalendarRows({ slideHeight: Number.NaN, rows: 6, minRowHeight: 50 })).toEqual({ rowHeight: 50, scroll: true });
  });
});
