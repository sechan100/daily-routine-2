import { Day } from "./day";


export class Week {
  readonly #startDay: Day;
  readonly #endDay: Day;

  constructor(day: Day) {
    this.#startDay = day.clone(m => m.startOf("week"));
    this.#endDay = day.clone(m => m.endOf("week"));
  }

  get startDay() {
    return this.#startDay;
  }

  get endDay() {
    return this.#endDay;
  }

  add_cpy(amount: number) {
    return new Week(
      this.#startDay.clone(m => m.add(amount * 7, "day"))
    );
  }

  subtract_cpy(amount: number) {
    return new Week(
      this.#startDay.clone(m => m.subtract(amount * 7, "day"))
    );
  }
}
