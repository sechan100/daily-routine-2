import moment from "moment";
// 로케일 등록(등록 시 전역 로케일이 바뀌므로 beforeEach에서 'en'으로 복원한다)
import "moment/locale/de";
import "moment/locale/ko";
import { Day, DayOfWeek } from "@shared/period/day";
import { Week } from "@shared/period/week";
import { Month } from "@shared/period/month";
import { DR_SETTING } from "@app/settings/setting-provider";

jest.mock("@app/settings/setting-provider", () => ({
  DR_SETTING: {
    isMondayStartOfWeek: jest.fn(() => true),
  },
}));

const setMondayStart = (value: boolean) => {
  (DR_SETTING.isMondayStartOfWeek as jest.Mock).mockReturnValue(value);
};

// en: 일요일 시작 로케일, de: 월요일 시작 로케일, ko: 일요일 시작 로케일
const LOCALES = ["en", "de", "ko"] as const;

beforeEach(() => {
  moment.locale("en");
  setMondayStart(true);
});

afterEach(() => {
  moment.locale("en");
});


describe("Day.dow", () => {
  // 실제 달력상의 요일들 (issue #13: 2025-10-21 화요일, issue #8: 2025-05-10 토요일)
  const KNOWN_DOW: [string, DayOfWeek][] = [
    ["2025-10-21", DayOfWeek.TUE],
    ["2025-05-10", DayOfWeek.SAT],
    ["2025-01-13", DayOfWeek.MON],
    ["2025-01-19", DayOfWeek.SUN],
    ["2024-02-29", DayOfWeek.THU],
  ];

  describe.each(LOCALES)("locale: %s", (locale) => {
    it.each(KNOWN_DOW)("%s의 요일은 %s", (date, expected) => {
      moment.locale(locale);
      expect(Day.fromString(date).dow).toBe(expected);
    });

    it("isMondayStartOfWeek 설정과 무관하게 동일하다", () => {
      moment.locale(locale);
      for (const mondayStart of [true, false]) {
        setMondayStart(mondayStart);
        expect(Day.fromString("2025-10-21").dow).toBe(DayOfWeek.TUE);
        expect(Day.fromString("2025-01-19").dow).toBe(DayOfWeek.SUN);
      }
    });
  });
});


describe("Day.max", () => {
  it("로컬 기준 9999-12-31이다 (UTC 변환으로 하루가 밀리지 않는다)", () => {
    expect(Day.max().format()).toBe("9999-12-31");
  });
});


describe("Week.of", () => {
  describe.each([true, false])("isMondayStartOfWeek: %s", (mondayStart) => {
    describe.each(LOCALES)("locale: %s", (locale) => {
      it("어떤 요일을 넣어도 그 날을 포함하는 주를 반환한다", () => {
        setMondayStart(mondayStart);
        moment.locale(locale);
        // 2주 연속 구간의 모든 요일을 검사
        let day = Day.fromString("2025-01-12");
        for (let i = 0; i < 14; i++) {
          const week = Week.of(day);
          expect(
            day.isBetween(week.startDay, week.endDay, "day", "[]")
          ).toBe(true);
          day = day.clone(m => m.add(1, "day"));
        }
      });
    });
  });

  describe.each(LOCALES)("주 시작일 (locale: %s)", (locale) => {
    it("월요일 시작: 주는 월요일부터 일요일까지다", () => {
      setMondayStart(true);
      moment.locale(locale);
      // 수요일
      const midWeek = Week.of(Day.fromString("2025-01-15"));
      expect(midWeek.startDay.format()).toBe("2025-01-13");
      expect(midWeek.startDay.dow).toBe(DayOfWeek.MON);
      expect(midWeek.endDay.format()).toBe("2025-01-19");
      // 월요일(주 시작일 자신)
      expect(Week.of(Day.fromString("2025-01-13")).startDay.format()).toBe("2025-01-13");
      // 일요일은 다음주가 아니라 같은 주에 속한다 (7ba75a3e 회귀 검증)
      expect(Week.of(Day.fromString("2025-01-19")).startDay.format()).toBe("2025-01-13");
    });

    it("일요일 시작: 주는 일요일부터 토요일까지다", () => {
      setMondayStart(false);
      moment.locale(locale);
      const midWeek = Week.of(Day.fromString("2025-01-15"));
      expect(midWeek.startDay.format()).toBe("2025-01-12");
      expect(midWeek.startDay.dow).toBe(DayOfWeek.SUN);
      expect(midWeek.endDay.format()).toBe("2025-01-18");
      // 일요일(주 시작일 자신)
      expect(Week.of(Day.fromString("2025-01-12")).startDay.format()).toBe("2025-01-12");
      // 토요일(주 마지막 날)
      expect(Week.of(Day.fromString("2025-01-18")).startDay.format()).toBe("2025-01-12");
    });
  });
});


describe("월 경계의 주", () => {
  describe.each(LOCALES)("locale: %s", (locale) => {
    it("월요일에 시작하는 달 (2025-09)", () => {
      moment.locale(locale);
      const month = new Month(Day.fromString("2025-09-15"));
      expect(month.startDay.format()).toBe("2025-09-01");
      expect(month.endDay.format()).toBe("2025-09-30");

      setMondayStart(true);
      expect(Week.of(month.startDay).startDay.format()).toBe("2025-09-01");
      expect(Week.of(month.endDay).startDay.format()).toBe("2025-09-29");
      expect(Week.of(month.endDay).endDay.format()).toBe("2025-10-05");

      setMondayStart(false);
      expect(Week.of(month.startDay).startDay.format()).toBe("2025-08-31");
      expect(Week.of(month.endDay).startDay.format()).toBe("2025-09-28");
      expect(Week.of(month.endDay).endDay.format()).toBe("2025-10-04");
    });

    it("연도 경계 (2025-01-01, 수요일)", () => {
      moment.locale(locale);
      const newYear = Day.fromString("2025-01-01");

      setMondayStart(true);
      expect(Week.of(newYear).startDay.format()).toBe("2024-12-30");

      setMondayStart(false);
      expect(Week.of(newYear).startDay.format()).toBe("2024-12-29");
    });
  });
});


describe("Day.isSameWeek", () => {
  describe.each(LOCALES)("locale: %s", (locale) => {
    it("월요일 시작 기준으로 같은 주를 판별한다", () => {
      setMondayStart(true);
      moment.locale(locale);
      const mon = Day.fromString("2025-01-13");
      const sun = Day.fromString("2025-01-19");
      const prevSun = Day.fromString("2025-01-12");
      expect(mon.isSameWeek(sun)).toBe(true);
      expect(mon.isSameWeek(prevSun)).toBe(false);
    });

    it("일요일 시작 기준으로 같은 주를 판별한다", () => {
      setMondayStart(false);
      moment.locale(locale);
      const sun = Day.fromString("2025-01-12");
      const sat = Day.fromString("2025-01-18");
      const nextSun = Day.fromString("2025-01-19");
      expect(sun.isSameWeek(sat)).toBe(true);
      expect(sat.isSameWeek(nextSun)).toBe(false);
    });
  });
});
