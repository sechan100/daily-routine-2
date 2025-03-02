import { DR_SETTING } from "@app/settings/setting-provider";
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
    const isMondayStart = DR_SETTING.isMondayStartOfWeek();
    const s = day.clone(m => m.startOf("week"));

    let startDay: Day;

    // 월요일 시작인데 일요일인 경우
    if(isMondayStart && s.dow === DayOfWeek.SUN) {
      startDay = s.clone(m => m.subtract(6, "day"));
    }
    // 일요일 시작인데 월요일인 경우(하루 앞으로)
    else if(!isMondayStart && s.dow === DayOfWeek.MON) {
      startDay = s.clone(m => m.subtract(1, "day"));
    }
    // 잘 부합하는 경우
    else {
      startDay = s;
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
