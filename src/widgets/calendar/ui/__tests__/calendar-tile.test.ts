import { Task, TaskState } from "@entities/note";
import { setAppLanguageForTest } from "@shared/i18n/language";
import { Day, DayOfWeek } from "@shared/period/day";
import { CalendarTile, isWeekendDow } from "@widgets/calendar/ui/CalendarTile";
import { TileHeightInfo } from "@widgets/calendar/ui/tile-height-info-context";
import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react";
import { DR_SETTING } from "@app/settings/setting-provider";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

// swiper의 css를 끌어오는 모듈이라 높이 context만 대신 둔다.
jest.mock("@shared/components/swipeable-calendar/SwipeableCalendar", () => ({
  useSlideHeight: () => 0,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const task = (name: string, state: TaskState): Task => ({
  elementType: "task",
  taskType: "routine",
  name,
  state,
  showOnCalendar: true,
  tags: [],
});

const today = Day.fromString("2026-10-23");
const layout = (limit: number): TileHeightInfo => ({ tileHeight: 100, limitedTaskPer: limit, scroll: false });

let container: HTMLDivElement;
let root: Root;

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

const render = (tasks: Task[], limit: number, day = today) => {
  act(() => {
    root.render(createElement(CalendarTile, { tile: { day, tasks }, layout: layout(limit), today }));
  });
};


describe("CalendarTile 문구", () => {
  const tasks = [task("Run", "accomplished"), task("Read", "failed"), task("Write", "un-checked"), task("Stretch", "un-checked")];

  it("영어: 항목 상태와 넘친 개수를 툴팁으로 알려준다", () => {
    setAppLanguageForTest("en");
    render(tasks, 3);
    const labels = Array.from(container.querySelectorAll("[aria-label]")).map(el => el.getAttribute("aria-label"));
    expect(labels).toEqual(["Run (done)", "Read (failed)", "2 more tasks"]);
    expect(container.textContent).toContain("+2");
  });

  it("한국어", () => {
    setAppLanguageForTest("ko");
    render(tasks, 3);
    const labels = Array.from(container.querySelectorAll("[aria-label]")).map(el => el.getAttribute("aria-label"));
    expect(labels).toEqual(["Run (완료)", "Read (실패)", "항목 2개 더"]);
  });

  it("항목 이름은 dir=auto로 그려 오른쪽에서 왼쪽으로 쓰는 이름도 제 방향으로 보인다", () => {
    setAppLanguageForTest("en");
    render([task("اقرأ كتابا", "un-checked")], 3);
    const chip = container.querySelector("[aria-label='اقرأ كتابا']");
    expect(chip?.getAttribute("dir")).toBe("auto");
  });

  it("날짜 숫자는 그 언어의 숫자로 쓴다", () => {
    setAppLanguageForTest("fa");
    render([], 3);
    expect(container.textContent).toBe("۲۳");
  });
});


describe("주말 음영", () => {
  it("토요일 시작 주가 아니면 토·일이 주말이다", () => {
    for(const start of [0, 1] as const){
      expect(isWeekendDow(DayOfWeek.FRI, start)).toBe(false);
      expect(isWeekendDow(DayOfWeek.SAT, start)).toBe(true);
      expect(isWeekendDow(DayOfWeek.SUN, start)).toBe(true);
      expect(isWeekendDow(DayOfWeek.MON, start)).toBe(false);
    }
  });

  it("토요일 시작 주(중동)는 금·토가 주말이다", () => {
    expect(isWeekendDow(DayOfWeek.FRI, 6)).toBe(true);
    expect(isWeekendDow(DayOfWeek.SAT, 6)).toBe(true);
    expect(isWeekendDow(DayOfWeek.SUN, 6)).toBe(false);
  });

  it("날짜 숫자 색이 설정한 주 시작 요일의 주말을 따라간다 (2026-10-16은 금요일)", () => {
    const friday = Day.fromString("2026-10-16");
    const badgeColor = () => getComputedStyle(container.querySelector("span") as HTMLElement).color;

    render([], 3, friday);
    const weekday = badgeColor();

    (DR_SETTING.weekStartDow as jest.Mock).mockReturnValue(6);
    render([], 3, friday);
    expect(badgeColor()).not.toBe(weekday);
  });
});
