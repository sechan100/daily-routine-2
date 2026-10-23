import { DR_SETTING } from "@app/settings/setting-provider";
import { DayOfWeek } from "@shared/period/day";
import { setAppLanguageForTest } from "@shared/i18n/language";
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { IntervalOption } from "../ui/active-criteria-interval";
import { MonthOption } from "../ui/active-criteria-month";
import { WeekOption } from "../ui/active-criteria-week";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
const render = (node: React.ReactNode) => act(() => root.render(node));

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  setAppLanguageForTest(null);
  (DR_SETTING.weekStartDow as jest.Mock).mockReturnValue(1);
});


describe("WeekOption", () => {
  const labels = () => [...container.querySelectorAll("button")].map(b => b.textContent);

  it("영어: 월요일부터 짧은 요일 이름을 보여준다", () => {
    setAppLanguageForTest("en");
    render(<WeekOption daysOfWeek={[DayOfWeek.MON]} setProperties={jest.fn()} />);
    expect(labels()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("한국어: 토요일 시작 주 설정을 따른다", () => {
    setAppLanguageForTest("ko");
    (DR_SETTING.weekStartDow as jest.Mock).mockReturnValue(6);
    render(<WeekOption daysOfWeek={[DayOfWeek.SAT]} setProperties={jest.fn()} />);
    expect(labels()).toEqual(["토", "일", "월", "화", "수", "목", "금"]);
    const first = container.querySelector("button");
    expect(first?.getAttribute("aria-label")).toBe("토요일");
    expect(first?.getAttribute("aria-pressed")).toBe("true");
  });

  it("아랍어: 짧은 이름이 단추를 넘치므로 한 글자 이름을 쓰고, 긴 이름은 aria-label에 둔다", () => {
    setAppLanguageForTest("ar");
    render(<WeekOption daysOfWeek={[DayOfWeek.MON]} setProperties={jest.fn()} />);
    const buttons = [...container.querySelectorAll("button")];
    const labels = buttons.map(b => b.textContent);
    expect(labels.every(text => Array.from(text ?? "").length === 1)).toBe(true);
    const monday = buttons[0];
    expect(Array.from(monday.getAttribute("aria-label") ?? "").length).toBeGreaterThan(3);
  });

  it("버튼을 누르면 요일 enum 값이 토글된다", () => {
    setAppLanguageForTest("ko");
    const setProperties = jest.fn();
    render(<WeekOption daysOfWeek={[DayOfWeek.MON]} setProperties={setProperties} />);
    act(() => container.querySelectorAll("button")[1].click());
    expect(setProperties).toHaveBeenCalledWith({ daysOfWeek: [DayOfWeek.MON, DayOfWeek.TUE] });
  });
});


describe("IntervalOption", () => {
  it("영어: 'Every N days'와 사용자 언어의 시작일을 보여주고, 저장 값은 그대로 둔다", () => {
    setAppLanguageForTest("en");
    render(<IntervalOption intervalDays={3} intervalStart="2026-10-23" setProperties={jest.fn()} />);
    expect(container.querySelector("label")?.textContent).toBe("Every  days");
    expect(container.querySelector("input")?.value).toBe("3");
    expect(container.textContent).toContain("Start date: Oct 23, 2026");
  });

  it("문장과 시작일 줄은 dir=auto라 오른쪽에서 왼쪽으로 쓰는 앱에서도 영어 어순이 유지된다", () => {
    setAppLanguageForTest("en");
    render(<IntervalOption intervalDays={3} intervalStart="2026-10-23" setProperties={jest.fn()} />);
    expect(container.querySelector("label")?.getAttribute("dir")).toBe("auto");
    expect(container.querySelector("span[dir='auto']")?.textContent).toContain("Start date");
  });

  it("한국어: 입력칸 뒤에 '일마다'가 붙는다", () => {
    setAppLanguageForTest("ko");
    render(<IntervalOption intervalDays={3} intervalStart="2026-10-23" setProperties={jest.fn()} />);
    expect(container.querySelector("label")?.textContent).toBe("일마다");
    expect(container.textContent).toContain("시작일: 2026년 10월 23일");
    expect(container.querySelectorAll("button")[0].textContent).toBe("오늘부터 시작");
  });
});


describe("MonthOption", () => {
  it("영어: 마지막 날 버튼이 'Last day'이고 날짜 타일은 1~31이다", () => {
    setAppLanguageForTest("en");
    render(<MonthOption daysOfMonth={[1]} setProperties={jest.fn()} />);
    const buttons = [...container.querySelectorAll("button")].map(b => b.textContent);
    expect(buttons).toContain("Last day");
    expect(buttons.filter(text => /^\d+$/.test(text ?? "")).length).toBe(31);
  });

  it.each([0, 1, 6])("주 시작 요일 설정(%i)과 무관하게 앞쪽 빈 칸이 없다 (고정된 달이라 1일이 첫 칸이다)", (weekStart) => {
    (DR_SETTING.weekStartDow as jest.Mock).mockReturnValue(weekStart);
    setAppLanguageForTest("en");
    render(<MonthOption daysOfMonth={[1]} setProperties={jest.fn()} />);
    const firstTile = container.querySelector(".react-calendar__month-view__days > button") as HTMLElement;
    // react-calendar는 앞쪽 빈 칸을 첫 타일의 여백으로 만든다.
    expect(firstTile.style.marginLeft).toBe("");
  });

  it("한국어: 마지막 날 버튼이 '말일'이고, 누르면 0(마지막 날)이 토글된다", () => {
    setAppLanguageForTest("ko");
    const setProperties = jest.fn();
    render(<MonthOption daysOfMonth={[1]} setProperties={setProperties} />);
    const lastDay = [...container.querySelectorAll("button")].find(b => b.textContent === "말일");
    expect(lastDay).toBeDefined();
    act(() => lastDay?.click());
    expect(setProperties).toHaveBeenCalledWith({ daysOfMonth: [1, 0] });
  });
});
