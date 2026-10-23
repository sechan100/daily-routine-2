import { allShortWeekdayLabels, pickWeekdayStyle } from "@shared/components/swipeable-calendar/weekday-labels";
import { setAppLanguageForTest } from "@shared/i18n/language";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    weekStartDow: jest.fn(() => 1),
  },
}));

afterEach(() => setAppLanguageForTest(null));

// 사이드바가 가장 좁을 때(약 280px)의 칸 너비
const NARROW_COLUMN = 280 / 7;


describe("pickWeekdayStyle", () => {
  it("짧은 이름이 칸에 들어가면 그대로 쓴다", () => {
    expect(pickWeekdayStyle(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], NARROW_COLUMN)).toBe("short");
    expect(pickWeekdayStyle(["일", "월", "화", "수", "목", "금", "토"], NARROW_COLUMN)).toBe("short");
    expect(pickWeekdayStyle(["Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa.", "So."], NARROW_COLUMN)).toBe("short");
  });

  it("'.'은 react-calendar가 지우므로 글자 수에서 뺀다", () => {
    expect(pickWeekdayStyle(["niedz.", "pon."], NARROW_COLUMN)).toBe("short");
  });

  it("칸을 넘치는 긴 이름은 한 글자 이름으로 바꾼다", () => {
    expect(pickWeekdayStyle(["الاثنين", "الأحد"], NARROW_COLUMN)).toBe("narrow");
  });

  it("같은 이름도 칸이 넓어지면 짧은 이름으로 돌아온다", () => {
    expect(pickWeekdayStyle(["الاثنين"], 60)).toBe("short");
  });

  it("너비를 아직 모르면(0) 짧은 이름을 쓴다", () => {
    expect(pickWeekdayStyle(["الاثنين"], 0)).toBe("short");
  });
});


describe("allShortWeekdayLabels", () => {
  it("일주일 7개 이름을 현재 언어로 돌려준다", () => {
    setAppLanguageForTest("en");
    expect(allShortWeekdayLabels()).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    setAppLanguageForTest("ko");
    expect(allShortWeekdayLabels()).toEqual(["일", "월", "화", "수", "목", "금", "토"]);
  });
});
