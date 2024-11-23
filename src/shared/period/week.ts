import { Day } from "./day";


export class Week {
  #startDay: Day;

  constructor(day: Day) {
    this.#startDay = day.clone(m => m.startOf("week"));
  }

  get startDay() {
    return this.#startDay;
  }

  get endDay() {
    return this.#startDay.clone(m => m.endOf("week"));
  }

  add(amount: number) {
    return new Week(
      this.#startDay.add(amount * 7, "day")
    );
  }

  subtract(amount: number) {
    return new Week(
      this.#startDay.subtract(amount * 7, "day")
    );
  }
}
