import { DR_SETTING } from "@app/settings/setting-provider";
import { Day } from "./day";


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
    // 로케일에 따라 달라지는 startOf("week") 대신, 설정된 주 시작 요일로부터 직접 계산한다.
    const weekStartDow = DR_SETTING.isMondayStartOfWeek() ? 1 : 0; // moment: 0=SUN, 1=MON (로케일 무관)
    const startDay = day.clone(m => {
      const diff = (m.day() - weekStartDow + 7) % 7;
      m.subtract(diff, "day").startOf("day");
    });
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
