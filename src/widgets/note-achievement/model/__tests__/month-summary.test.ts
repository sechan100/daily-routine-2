import { Task, TaskState } from "@entities/note/domain/note.type";
import { Day } from "@shared/period/day";
import { Month } from "@shared/period/month";
import { DayTasks, NoteMonthSummarizer } from "@widgets/note-achievement/model/month-summary";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

const task = (name: string, state: TaskState): Task => ({
  elementType: "task",
  taskType: "routine",
  name,
  state,
  showOnCalendar: false,
  tags: [],
});

const note = (date: string, ...states: TaskState[]): DayTasks => ({
  day: Day.fromString(date),
  tasks: states.map((s, i) => task(`t${i}`, s)),
});

const feb = new Month(Day.fromString("2025-02-14"));
const at = (date: string) => Day.fromString(`${date}T15:30`);


describe("NoteMonthSummarizer.summarize", () => {
  it("노트가 없으면 모두 0이고 비율도 NaN이 아니다", () => {
    expect(NoteMonthSummarizer.summarize([], feb, at("2025-02-20"))).toEqual({
      trackedDays: 0,
      perfectDays: 0,
      totalTasks: 0,
      accomplishedTasks: 0,
      accomplishment: 0,
    });
  });

  it("노트가 있는 날의 task 합으로 비율을 계산하고, failed는 완료로 세지 않는다", () => {
    const rs = NoteMonthSummarizer.summarize([
      note("2025-02-01", "accomplished", "accomplished"),
      note("2025-02-02", "accomplished", "failed", "un-checked", "accomplished"),
    ], feb, at("2025-02-20"));
    expect(rs.totalTasks).toBe(6);
    expect(rs.accomplishedTasks).toBe(4);
    expect(rs.accomplishment).toBeCloseTo(66.67, 1);
    expect(rs.trackedDays).toBe(2);
    expect(rs.perfectDays).toBe(1);
  });

  it("task가 없는 노트는 기록한 날로 세지만 완벽한 날로는 세지 않는다", () => {
    const rs = NoteMonthSummarizer.summarize([note("2025-02-03")], feb, at("2025-02-20"));
    expect(rs.trackedDays).toBe(1);
    expect(rs.perfectDays).toBe(0);
  });

  it("이웃한 달의 노트는 월 경계에서 정확히 제외한다", () => {
    const rs = NoteMonthSummarizer.summarize([
      note("2025-01-31", "accomplished"),
      note("2025-02-01", "un-checked"),
      note("2025-02-28", "accomplished"),
      note("2025-03-01", "accomplished"),
    ], feb, at("2025-03-10"));
    expect(rs.trackedDays).toBe(2);
    expect(rs.totalTasks).toBe(2);
    expect(rs.accomplishedTasks).toBe(1);
  });

  it("오늘 노트는 포함하고 미래 노트는 제외한다", () => {
    const rs = NoteMonthSummarizer.summarize([
      note("2025-02-10", "accomplished"),
      note("2025-02-11", "un-checked"),
    ], feb, at("2025-02-10"));
    expect(rs.trackedDays).toBe(1);
    expect(rs.accomplishment).toBe(100);
    expect(rs.perfectDays).toBe(1);
  });
});
