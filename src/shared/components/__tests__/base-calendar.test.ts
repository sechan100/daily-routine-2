import { DR_SETTING } from "@app/settings/setting-provider";
import { BaseCalendar } from "@shared/components/BaseCalendar";
import { countCalendarWeeks, getCalendarGridRange } from "@shared/components/swipeable-calendar/calendar-grid";
import { setAppLanguageForTest } from "@shared/i18n/language";
import { formatDayOfWeek } from "@shared/i18n";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

jest.mock("@shared/view/use-leaf", () => ({
  useLeaf: () => ({ leafBgColor: "white" }),
}));


(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver = ResizeObserverStub;

let container: HTMLDivElement;
let root: Root;
let wrapperWidth = 0;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  wrapperWidth = 0;
  // jsdom은 레이아웃이 없어 clientWidth가 항상 0이다. 사이드바 너비를 흉내 낸다.
  jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => wrapperWidth);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.restoreAllMocks();
  setAppLanguageForTest(null);
});

const render = (month: Month) => {
  act(() => {
    root.render(createElement(BaseCalendar, {
      month,
      setMonth: () => {},
      tile: (day: Day) => createElement("i", { "data-day": day.format() }),
      showNavigation: false,
    }));
  });
};

const setWeekStart = (dow: 0 | 1 | 6) => (DR_SETTING.weekStartDow as jest.Mock).mockReturnValue(dow);
const headers = () => Array.from(container.querySelectorAll<HTMLElement>(".react-calendar__month-view__weekdays abbr"));
const tileDays = () => Array.from(container.querySelectorAll<HTMLElement>("[data-day]")).map(el => el.dataset.day);

const month = new Month(Day.fromString("2025-08-14"));


describe("BaseCalendar 주 시작 요일", () => {
  it.each([
    ["월요일", 1],
    ["일요일", 0],
    ["토요일", 6],
  ] as const)("%s 시작: 요일 머리글, 칸 수, 첫 칸·마지막 칸이 그리드 계산과 일치한다", (_label, start) => {
    setWeekStart(start);
    setAppLanguageForTest("en");
    render(month);

    expect(headers().map(h => h.title)).toEqual(Day.getDaysOfWeek().map(dow => formatDayOfWeek(dow, "long")));

    const days = tileDays();
    const range = getCalendarGridRange(month);
    expect(days).toHaveLength(countCalendarWeeks(month) * 7);
    expect(days[0]).toBe(range.startDay.format());
    expect(days[days.length - 1]).toBe(range.endDay.format());
    expect(Day.fromString(days[0] as string).dow).toBe(Day.getDaysOfWeek()[0]);
  });
});


describe("BaseCalendar 요일 머리글 언어", () => {
  it("한국어면 한글 요일 이름을 쓴다", () => {
    setWeekStart(0);
    setAppLanguageForTest("ko");
    render(month);
    expect(headers().map(h => h.textContent)).toEqual(["일", "월", "화", "수", "목", "금", "토"]);
  });

  it("칸 너비가 충분하면 짧은 이름, 좁으면 긴 언어만 한 글자 이름으로 바꾼다", () => {
    setWeekStart(1);
    setAppLanguageForTest("ar");
    wrapperWidth = 700;
    render(month);
    expect(headers()[0].textContent).toBe(formatDayOfWeek(Day.getDaysOfWeek()[0], "short"));

    wrapperWidth = 280;
    act(() => root.unmount());
    root = createRoot(container);
    render(month);
    expect(headers()[0].textContent).toBe(formatDayOfWeek(Day.getDaysOfWeek()[0], "narrow"));
    // 툴팁에는 긴 이름이 남는다.
    expect(headers()[0].title).toBe(formatDayOfWeek(Day.getDaysOfWeek()[0], "long"));

    setAppLanguageForTest("de");
    act(() => root.unmount());
    root = createRoot(container);
    render(month);
    expect(headers()[0].textContent).toBe("Mo");
  });
});
