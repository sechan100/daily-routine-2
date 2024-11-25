import { Day } from "./day";



export class Month {
  readonly #startDay: Day;
  readonly #endDay: Day;

  constructor(day: Day) {
    this.#startDay = day.clone(m => m.startOf("month"));
    this.#endDay = day.clone(m => m.endOf("month"));
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
    return this.#endDay;
  }

  get num(){
    return this.#startDay.month;
  }

  add_cpy(amount: number) {
    return new Month(
      this.#startDay.clone(m => m.add(amount, "month"))
    );
  }

  subtract_cpy(amount: number) {
    return new Month(
      this.#startDay.clone(m => m.subtract(amount, "month"))
    );
  }

}