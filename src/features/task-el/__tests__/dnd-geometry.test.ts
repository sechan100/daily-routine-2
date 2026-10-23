import { HitAreaEvaluator } from "@features/task-el/dnd/hit-area";
import { getAutoScrollVelocity } from "@features/task-el/dnd/use-dnd-scroll";

// react-dnd는 ESM 전용이라 jest에서 불러올 수 없다. 순수 함수만 검사하므로 hook은 쓰지 않는다.
jest.mock("react-dnd", () => ({ useDragDropManager: jest.fn() }));


describe("HitAreaEvaluator.evaluateGroup", () => {
  const rect = { top: 100, bottom: 140, height: 40 };

  test("닫혀 있거나 빈 group에는 task를 위·안·아래로 놓을 수 있다", () => {
    const option = { allowIn: true, allowBottom: true };
    expect(HitAreaEvaluator.evaluateGroup(105, rect, option)).toBe("top");
    expect(HitAreaEvaluator.evaluateGroup(120, rect, option)).toBe("in");
    expect(HitAreaEvaluator.evaluateGroup(135, rect, option)).toBe("bottom");
  });

  test("닫혀 있거나 빈 group에는 group을 위·아래로만 놓을 수 있다", () => {
    const option = { allowIn: false, allowBottom: true };
    expect(HitAreaEvaluator.evaluateGroup(115, rect, option)).toBe("top");
    expect(HitAreaEvaluator.evaluateGroup(125, rect, option)).toBe("bottom");
  });

  test("펼쳐진 group의 header에는 위로만 놓을 수 있다", () => {
    const option = { allowIn: false, allowBottom: false };
    expect(HitAreaEvaluator.evaluateGroup(115, rect, option)).toBe("top");
    expect(HitAreaEvaluator.evaluateGroup(125, rect, option)).toBeNull();
  });
});


describe("HitAreaEvaluator.evaluateTask", () => {
  const rect = { top: 0, bottom: 40, height: 40 };

  test("위·아래 40%만 판정하고 가운데는 null", () => {
    expect(HitAreaEvaluator.evaluateTask(10, rect)).toBe("top");
    expect(HitAreaEvaluator.evaluateTask(20, rect)).toBeNull();
    expect(HitAreaEvaluator.evaluateTask(30, rect)).toBe("bottom");
  });
});


describe("getAutoScrollVelocity", () => {
  const rect = { top: 100, bottom: 500, left: 0, right: 300 };
  const at = (y: number, x = 150) => getAutoScrollVelocity({ x, y }, rect, 48, 720);

  test("가장자리 영역 밖에서는 스크롤하지 않는다", () => {
    expect(at(300)).toBe(0);
    expect(at(148)).toBe(0);
    expect(at(452)).toBe(0);
  });

  test("가장자리에 깊이 들어갈수록 빨라지고, 위·아래가 대칭이다", () => {
    expect(at(124)).toBeCloseTo(-360);
    expect(at(476)).toBeCloseTo(360);
    expect(at(100)).toBeCloseTo(-720);
    expect(at(500)).toBeCloseTo(720);
  });

  test("영역 밖으로 벗어나도 최대 속도를 넘지 않는다", () => {
    expect(at(0)).toBeCloseTo(-720);
    expect(at(900)).toBeCloseTo(720);
  });

  test("옆으로 벗어나면 스크롤하지 않는다", () => {
    expect(at(100, 400)).toBe(0);
  });

  test("영역이 작으면 가장자리 영역을 절반으로 줄인다", () => {
    const small = { top: 0, bottom: 60, left: 0, right: 300 };
    expect(getAutoScrollVelocity({ x: 10, y: 30 }, small, 48, 720)).toBe(0);
    expect(getAutoScrollVelocity({ x: 10, y: 15 }, small, 48, 720)).toBeCloseTo(-360);
  });
});
