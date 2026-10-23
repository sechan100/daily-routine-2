import { syncToday, useToday } from "../use-today";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));


describe("syncToday", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("날짜가 그대로면 store를 바꾸지 않는다", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 23, 10, 0));
    syncToday();
    const before = useToday.getState().today;

    jest.setSystemTime(new Date(2026, 9, 23, 23, 59));
    syncToday();
    expect(useToday.getState().today).toBe(before);
  });

  test("자정을 넘기면 새 오늘로 갱신하고 구독자에게 알린다", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 23, 23, 59));
    syncToday();
    expect(useToday.getState().today.format()).toBe("2026-10-23");

    const listener = jest.fn();
    const unsubscribe = useToday.subscribe(listener);
    jest.setSystemTime(new Date(2026, 9, 24, 0, 1));
    syncToday();
    unsubscribe();

    expect(useToday.getState().today.format()).toBe("2026-10-24");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
