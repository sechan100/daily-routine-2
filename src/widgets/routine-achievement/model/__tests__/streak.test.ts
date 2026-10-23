import { Task, TaskState } from "@entities/note/domain/note.type";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { DayTasks, RoutineOccurrence, RoutineStreakCalculator } from "@widgets/routine-achievement/model/streak";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

const { collectOccurrences, computeStreak, summarizeMonth } = RoutineStreakCalculator;

const ROUTINE = "Workout";

const task = (name: string, state: TaskState, taskType: Task["taskType"] = "routine"): Task => ({
  elementType: "task",
  taskType,
  name,
  state,
  showOnCalendar: false,
  tags: [],
});

const dayTasks = (date: string, ...tasks: Task[]): DayTasks => ({
  day: Day.fromString(date),
  tasks,
});

// [날짜, 상태] 목록으로 루틴 회차를 만든다. 노트가 없는 날은 목록에서 빼서 표현한다.
const occurrences = (...entries: [string, TaskState][]): RoutineOccurrence[] => collectOccurrences(
  entries.map(([date, state]) => dayTasks(date, task(ROUTINE, state))),
  ROUTINE,
);

// Day.today()는 현재 시각을 포함하므로, 오늘 기준 비교가 시각에 흔들리지 않는지도 함께 확인한다.
const at = (date: string, time = "15:30") => Day.fromString(`${date}T${time}`);


describe("collectOccurrences", () => {
  it("이름이 같은 routine task만 회차로 모으고 날짜 오름차순으로 정렬한다", () => {
    const rs = collectOccurrences([
      dayTasks("2025-03-03", task(ROUTINE, "failed")),
      dayTasks("2025-03-01", task(ROUTINE, "accomplished"), task("Read", "un-checked")),
      dayTasks("2025-03-02", task("Read", "accomplished")),
      dayTasks("2025-03-04", task(ROUTINE, "accomplished", "todo")),
    ], ROUTINE);

    expect(rs.map(o => [o.day.format(), o.state])).toEqual([
      ["2025-03-01", "accomplished"],
      ["2025-03-03", "failed"],
    ]);
  });
});


describe("computeStreak", () => {
  it("회차가 없으면 0", () => {
    expect(computeStreak([], at("2025-03-10"))).toEqual({ current: 0, longest: 0 });
  });

  it("오늘의 미체크 회차는 현재 연속 기록을 끊지 않는다", () => {
    const os = occurrences(
      ["2025-03-08", "accomplished"],
      ["2025-03-09", "accomplished"],
      ["2025-03-10", "un-checked"],
    );
    expect(computeStreak(os, at("2025-03-10"))).toEqual({ current: 2, longest: 2 });
    expect(computeStreak(os, at("2025-03-10", "00:00"))).toEqual({ current: 2, longest: 2 });
    expect(computeStreak(os, at("2025-03-10", "23:59"))).toEqual({ current: 2, longest: 2 });
  });

  it("오늘 완료한 회차는 현재 연속 기록에 포함된다", () => {
    const os = occurrences(
      ["2025-03-09", "accomplished"],
      ["2025-03-10", "accomplished"],
    );
    expect(computeStreak(os, at("2025-03-10"))).toEqual({ current: 2, longest: 2 });
  });

  it("오늘 실패하면 현재 연속 기록은 0", () => {
    const os = occurrences(
      ["2025-03-09", "accomplished"],
      ["2025-03-10", "failed"],
    );
    expect(computeStreak(os, at("2025-03-10"))).toEqual({ current: 0, longest: 1 });
  });

  it("'failed' 회차는 연속 기록을 끊는다", () => {
    const os = occurrences(
      ["2025-03-01", "accomplished"],
      ["2025-03-02", "accomplished"],
      ["2025-03-03", "accomplished"],
      ["2025-03-04", "failed"],
      ["2025-03-05", "accomplished"],
    );
    expect(computeStreak(os, at("2025-03-10"))).toEqual({ current: 1, longest: 3 });
  });

  it("지나간 날의 미체크 회차는 연속 기록을 끊는다", () => {
    const os = occurrences(
      ["2025-03-07", "accomplished"],
      ["2025-03-08", "un-checked"],
      ["2025-03-09", "accomplished"],
    );
    expect(computeStreak(os, at("2025-03-10"))).toEqual({ current: 1, longest: 1 });
  });

  it("노트가 없는 날(회차 없음)은 연속 기록을 끊지 않는다", () => {
    // 월·수·금만 기록이 있는 주 3회 루틴
    const os = occurrences(
      ["2025-03-03", "accomplished"],
      ["2025-03-05", "accomplished"],
      ["2025-03-07", "accomplished"],
    );
    expect(computeStreak(os, at("2025-03-10"))).toEqual({ current: 3, longest: 3 });
  });

  it("월 경계를 넘어 이어진다", () => {
    const os = occurrences(
      ["2025-01-30", "accomplished"],
      ["2025-01-31", "accomplished"],
      ["2025-02-01", "accomplished"],
      ["2025-02-02", "accomplished"],
    );
    expect(computeStreak(os, at("2025-02-02"))).toEqual({ current: 4, longest: 4 });
  });

  it("미래의 회차는 무시한다", () => {
    const os = occurrences(
      ["2025-03-09", "accomplished"],
      ["2025-03-11", "un-checked"],
      ["2025-03-12", "failed"],
    );
    expect(computeStreak(os, at("2025-03-10"))).toEqual({ current: 1, longest: 1 });
  });

  it("가장 긴 기록은 끊긴 이전 구간에서도 찾는다", () => {
    const os = occurrences(
      ["2025-02-27", "accomplished"],
      ["2025-02-28", "accomplished"],
      ["2025-03-01", "accomplished"],
      ["2025-03-02", "accomplished"],
      ["2025-03-03", "failed"],
      ["2025-03-04", "accomplished"],
      ["2025-03-05", "un-checked"],
    );
    expect(computeStreak(os, at("2025-03-05"))).toEqual({ current: 1, longest: 4 });
  });
});


describe("summarizeMonth", () => {
  const os = occurrences(
    ["2025-01-31", "accomplished"],
    ["2025-02-01", "accomplished"],
    ["2025-02-02", "failed"],
    ["2025-02-03", "un-checked"],
    ["2025-02-04", "un-checked"],
    ["2025-03-01", "accomplished"],
  );
  const feb = new Month(Day.fromString("2025-02-10"));

  it("해당 월의 오늘까지 회차만 세고, 오늘의 미체크 회차는 예정에 포함한다", () => {
    expect(summarizeMonth(os, feb, at("2025-02-03"))).toEqual({ done: 1, scheduled: 3 });
  });

  it("월의 첫날과 마지막 날 경계를 정확히 나눈다", () => {
    expect(summarizeMonth(os, feb, at("2025-03-15"))).toEqual({ done: 1, scheduled: 4 });
    const jan = new Month(Day.fromString("2025-01-01"));
    expect(summarizeMonth(os, jan, at("2025-03-15"))).toEqual({ done: 1, scheduled: 1 });
  });

  it("회차가 없는 월은 0/0", () => {
    const apr = new Month(Day.fromString("2025-04-01"));
    expect(summarizeMonth(os, apr, at("2025-04-20"))).toEqual({ done: 0, scheduled: 0 });
  });
});
