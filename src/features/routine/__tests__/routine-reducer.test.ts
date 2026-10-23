import { RoutineProperties } from "@entities/routine/domain/routine-type";
import { DayOfWeek } from "@shared/period/day";
import { getActiveCriteriaError } from "@features/routine/routine-reducer";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

const makeProps = (props: Partial<RoutineProperties>): RoutineProperties => ({
  order: 0,
  group: "UNGROUPED",
  showOnCalendar: false,
  activeCriteria: "week",
  daysOfWeek: [DayOfWeek.MON],
  daysOfMonth: [1],
  intervalDays: 1,
  intervalStart: "2025-01-01",
  enabled: true,
  tags: [],
  ...props,
});

describe("getActiveCriteriaError", () => {
  it("요일을 하나도 고르지 않은 week 루틴은 저장할 수 없다", () => {
    expect(getActiveCriteriaError(makeProps({ activeCriteria: "week", daysOfWeek: [] }))).not.toBeNull();
    expect(getActiveCriteriaError(makeProps({ activeCriteria: "week", daysOfWeek: [DayOfWeek.SUN] }))).toBeNull();
  });

  it("날짜를 하나도 고르지 않은 month 루틴은 저장할 수 없다", () => {
    expect(getActiveCriteriaError(makeProps({ activeCriteria: "month", daysOfMonth: [] }))).not.toBeNull();
    // 0은 '마지막 날'이다.
    expect(getActiveCriteriaError(makeProps({ activeCriteria: "month", daysOfMonth: [0] }))).toBeNull();
  });

  it("활성 기준이 아닌 쪽의 비어 있는 값은 무시한다", () => {
    expect(getActiveCriteriaError(makeProps({ activeCriteria: "week", daysOfMonth: [] }))).toBeNull();
    expect(getActiveCriteriaError(makeProps({ activeCriteria: "month", daysOfWeek: [] }))).toBeNull();
  });

  it.each([NaN, 0, -1, 1.5])("interval 루틴의 intervalDays가 %p 이면 저장할 수 없다", (intervalDays) => {
    expect(getActiveCriteriaError(makeProps({ activeCriteria: "interval", intervalDays }))).not.toBeNull();
  });

  it("interval 루틴의 intervalDays가 1 이상의 정수면 저장할 수 있다", () => {
    expect(getActiveCriteriaError(makeProps({ activeCriteria: "interval", intervalDays: 3 }))).toBeNull();
  });
});
