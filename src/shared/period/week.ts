import { SETTINGS } from "@/shared/settings";
import { Day, DayOfWeek } from "./day";


export class Week {
  readonly #startDay: Day;
  readonly #endDay: Day;

  /**
   * moment의 전체 설정을 변경할 수 없기 때문에, 여기서 설정을 적용해야한다.
   * DR_SETTING.isMondayStartOfWeek()를 통해 월요일부터 시작하는지를 확인하고,
   * 그에 따라서 startDay와 endDay를 적절히 조정한다.
   */
  private constructor(startOfDay: Day) {
    this.#startDay = startOfDay;
    this.#endDay = startOfDay.clone(m => m.add(6, "day"));
  }

  static of(day: Day): Week {
    const isMondayStart = SETTINGS.isMondayStartOfWeek();

    // 현재 날짜의 요일 확인
    const dowNum = parseInt(day.format("d"), 10);
    const dow = day.dow;
    let startDay: Day;

    // dow가 0(일요일)부터 6(토요일)까지라고 가정
    if (isMondayStart) {
      // 월요일 시작 원하는 경우
      // 현재 요일이 일요일(0)이면 6일 빼기, 아니면 (현재요일 - 1)일 빼기
      const daysToSubtract = dow === DayOfWeek.SUN ? 6 : dowNum - 1;
      startDay = day.clone(m => m.subtract(daysToSubtract, "day"));
    } else {
      // 일요일 시작 원하는 경우
      // 현재 요일에서 그만큼 빼기
      const daysToSubtract = dowNum;
      startDay = day.clone(m => m.subtract(daysToSubtract, "day"));
    }

    return new Week(startDay);
  }

  get startDay() {
    return this.#startDay;
  }

  get endDay() {
    return this.#endDay;
  }

  get weekNum() {
    return this.#startDay.week;
  }

  add_cpy(amount: number) {
    const newStartOfweek = this.#startDay.clone(m => m.add(amount * 7, "day"));
    return new Week(newStartOfweek);
  }

  subtract_cpy(amount: number) {
    const newStartOfweek = this.#startDay.clone(m => m.subtract(amount * 7, "day"))
    return new Week(newStartOfweek);
  }
}
