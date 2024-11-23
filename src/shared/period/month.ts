import { Day } from "./day";



export class Month {
  #startDay: Day;

  constructor(day: Day) {
    this.#startDay = day.clone(m => m.startOf("month"));
  }

  static fromJsDate(date: Date){
    return new Month(Day.fromJsDate(date));
  }

  static now() {
    return new Month(Day.now());
  }

  get startDay() {
    return this.#startDay;
  }

  get endDay() {
    return this.#startDay.clone(m => m.endOf("month"));
  }

  add(amount: number) {
    return new Month(
      this.#startDay.add(amount, "month")
    );
  }

  subtract(amount: number) {
    return new Month(
      this.#startDay.subtract(amount, "month")
    );
  }
}