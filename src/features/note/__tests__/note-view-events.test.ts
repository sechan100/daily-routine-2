import { noteViewEvents } from "../note-view-events";


describe("noteViewEvents", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("구독자가 있으면 바로 전달한다", () => {
    const handler = jest.fn();
    const unsubscribe = noteViewEvents.subscribe(handler);
    noteViewEvents.dispatch({ type: "add-todo" });
    unsubscribe();
    expect(handler).toHaveBeenCalledWith({ type: "add-todo" });
  });

  test("구독자가 없을 때 보낸 동작은 다음 구독 시 한 번만 전달한다", () => {
    noteViewEvents.dispatch({ type: "shift-day", offset: -1 });

    const first = jest.fn();
    const unsubscribeFirst = noteViewEvents.subscribe(first);
    unsubscribeFirst();
    const second = jest.fn();
    const unsubscribeSecond = noteViewEvents.subscribe(second);
    unsubscribeSecond();

    expect(first).toHaveBeenCalledWith({ type: "shift-day", offset: -1 });
    expect(second).not.toHaveBeenCalled();
  });

  test("보관한 동작은 유효 시간이 지나면 버린다", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 23, 10, 0, 0));
    noteViewEvents.dispatch({ type: "go-to-today" });
    jest.setSystemTime(new Date(2026, 9, 23, 10, 0, 10));

    const handler = jest.fn();
    const unsubscribe = noteViewEvents.subscribe(handler);
    unsubscribe();
    expect(handler).not.toHaveBeenCalled();
  });

  test("구독을 해제하면 더 이상 받지 않는다", () => {
    const handler = jest.fn();
    const unsubscribe = noteViewEvents.subscribe(handler);
    unsubscribe();
    noteViewEvents.dispatch({ type: "start-routine" });
    expect(handler).not.toHaveBeenCalled();

    // 다음 테스트에 남지 않도록 보관된 동작을 비운다.
    noteViewEvents.subscribe(() => {})();
  });
});
