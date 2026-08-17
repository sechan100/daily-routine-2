import { Day, DayOfWeek } from "@shared/period/day";
import { RoutineEntity } from "@entities/routine/domain/routine";
import { Routine, RoutineProperties } from "@entities/routine/domain/routine-type";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    isMondayStartOfWeek: jest.fn(() => true),
  },
}));

// obsidian이 런타임에 확장하는 Array.prototype 메서드를 테스트 환경에서 재현한다.
beforeAll(() => {
  Array.prototype.contains = function <T>(this: T[], target: T): boolean {
    return this.indexOf(target) > -1;
  };
  Array.prototype.remove = function <T>(this: T[], target: T): void {
    let index = this.indexOf(target);
    while (index > -1) {
      this.splice(index, 1);
      index = this.indexOf(target);
    }
  };
});

const makeRoutine = (props: Partial<RoutineProperties>): Routine => ({
  name: "test-routine",
  routineElementType: "routine",
  properties: {
    order: 0,
    group: "UNGROUPED",
    showOnCalendar: false,
    activeCriteria: "week",
    daysOfWeek: [],
    daysOfMonth: [],
    intervalDays: 1,
    intervalStart: "2025-01-01",
    enabled: true,
    tags: [],
    ...props,
  },
});

const isDueTo = (routine: Routine, dayStr: string) =>
  RoutineEntity.isDueTo(routine, Day.fromString(dayStr));


describe("isDueTo: interval", () => {
  const every3days = makeRoutine({
    activeCriteria: "interval",
    intervalDays: 3,
    intervalStart: "2025-01-10",
  });

  it("시작일 당일에 수행한다", () => {
    expect(isDueTo(every3days, "2025-01-10")).toBe(true);
  });

  it("시작일로부터 N일, 2N일 후에 수행한다", () => {
    expect(isDueTo(every3days, "2025-01-13")).toBe(true);
    expect(isDueTo(every3days, "2025-01-16")).toBe(true);
  });

  it("간격 사이의 날에는 수행하지 않는다", () => {
    expect(isDueTo(every3days, "2025-01-11")).toBe(false);
    expect(isDueTo(every3days, "2025-01-12")).toBe(false);
    expect(isDueTo(every3days, "2025-01-14")).toBe(false);
  });

  it("시작일 이전에는 수행하지 않는다 (간격이 정확히 맞아떨어지는 과거 날짜 포함)", () => {
    expect(isDueTo(every3days, "2025-01-09")).toBe(false);
    // -3일: 나머지 연산만으로는 0이 되므로 diff < 0 검사가 필요한 케이스
    expect(isDueTo(every3days, "2025-01-07")).toBe(false);
  });

  it("intervalDays가 1이면 시작일 이후 매일 수행한다", () => {
    const daily = makeRoutine({
      activeCriteria: "interval",
      intervalDays: 1,
      intervalStart: "2025-01-10",
    });
    expect(isDueTo(daily, "2025-01-10")).toBe(true);
    expect(isDueTo(daily, "2025-01-11")).toBe(true);
    expect(isDueTo(daily, "2025-02-27")).toBe(true);
    expect(isDueTo(daily, "2025-01-09")).toBe(false);
  });

  it("긴 간격(90일)도 월 경계를 넘어 정확히 계산한다", () => {
    const every90days = makeRoutine({
      activeCriteria: "interval",
      intervalDays: 90,
      intervalStart: "2025-01-01",
    });
    expect(isDueTo(every90days, "2025-01-01")).toBe(true);
    expect(isDueTo(every90days, "2025-04-01")).toBe(true); // +90일
    expect(isDueTo(every90days, "2025-03-31")).toBe(false);
    expect(isDueTo(every90days, "2025-04-02")).toBe(false);
  });

  it("enabled가 false면 수행하지 않는다", () => {
    const disabled = makeRoutine({
      activeCriteria: "interval",
      intervalDays: 3,
      intervalStart: "2025-01-10",
      enabled: false,
    });
    expect(isDueTo(disabled, "2025-01-10")).toBe(false);
  });
});


describe("isDueTo: week (회귀)", () => {
  const monWed = makeRoutine({
    activeCriteria: "week",
    daysOfWeek: [DayOfWeek.MON, DayOfWeek.WED],
  });

  it("지정한 요일에만 수행한다", () => {
    expect(isDueTo(monWed, "2025-01-13")).toBe(true); // MON
    expect(isDueTo(monWed, "2025-01-15")).toBe(true); // WED
    expect(isDueTo(monWed, "2025-01-14")).toBe(false); // TUE
    expect(isDueTo(monWed, "2025-01-19")).toBe(false); // SUN
  });
});


describe("isDueTo: month (회귀)", () => {
  it("지정한 날짜에만 수행한다", () => {
    const on15th = makeRoutine({
      activeCriteria: "month",
      daysOfMonth: [15],
    });
    expect(isDueTo(on15th, "2025-01-15")).toBe(true);
    expect(isDueTo(on15th, "2025-01-16")).toBe(false);
  });

  it("0은 그 달의 마지막 날로 취급한다", () => {
    const lastDay = makeRoutine({
      activeCriteria: "month",
      daysOfMonth: [0],
    });
    expect(isDueTo(lastDay, "2025-01-31")).toBe(true);
    expect(isDueTo(lastDay, "2025-02-28")).toBe(true);
    expect(isDueTo(lastDay, "2025-01-30")).toBe(false);
  });
});


describe("validateRoutineProperties: interval 하위 호환", () => {
  const oldFormatProperties = () => ({
    order: 0,
    group: "UNGROUPED",
    showOnCalendar: false,
    activeCriteria: "week",
    daysOfWeek: [DayOfWeek.MON],
    daysOfMonth: [1],
    enabled: true,
  });

  it("intervalDays/intervalStart가 없는 구버전 파일은 기본값으로 채워진다", () => {
    const result = RoutineEntity.validateRoutineProperties(oldFormatProperties());
    expect(result.isOk()).toBe(true);
    const p = result._unsafeUnwrap();
    expect(p.intervalDays).toBe(1);
    expect(p.intervalStart).toBe(Day.today().format());
  });

  it("activeCriteria로 'interval'을 허용한다", () => {
    const result = RoutineEntity.validateRoutineProperties({
      ...oldFormatProperties(),
      activeCriteria: "interval",
      intervalDays: 7,
      intervalStart: "2025-06-01",
    });
    expect(result.isOk()).toBe(true);
    const p = result._unsafeUnwrap();
    expect(p.intervalDays).toBe(7);
    expect(p.intervalStart).toBe("2025-06-01");
  });

  it("유효하지 않은 intervalDays는 거부한다", () => {
    for (const intervalDays of [0, -1, 1.5, "3"]) {
      const result = RoutineEntity.validateRoutineProperties({
        ...oldFormatProperties(),
        intervalDays,
      });
      expect(result.isErr()).toBe(true);
    }
  });

  it("유효하지 않은 intervalStart는 거부한다", () => {
    for (const intervalStart of ["2025-13-01", "2025-01-32", "not-a-date", 20250101]) {
      const result = RoutineEntity.validateRoutineProperties({
        ...oldFormatProperties(),
        intervalStart,
      });
      expect(result.isErr()).toBe(true);
    }
  });

  it("tags가 없는 구버전 파일은 빈 배열로 채워진다", () => {
    const result = RoutineEntity.validateRoutineProperties(oldFormatProperties());
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().tags).toEqual([]);
  });

  it("tags는 정규화('#' 제거, trim, 중복 제거)되어 검증된다", () => {
    const result = RoutineEntity.validateRoutineProperties({
      ...oldFormatProperties(),
      tags: ["#health", " fitness ", "health"],
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap().tags).toEqual(["health", "fitness"]);
  });

  it("유효하지 않은 tags는 거부한다", () => {
    for (const tags of ["health", [""], ["#"], ["he alth"], ["50%"], [1]]) {
      const result = RoutineEntity.validateRoutineProperties({
        ...oldFormatProperties(),
        tags,
      });
      expect(result.isErr()).toBe(true);
    }
  });
});
