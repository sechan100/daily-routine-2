import { Day } from "./day";



export type MonthFormat = string;

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
    return new Month(Day.today());
  }

  get startDay() {
    return this.#startDay;
  }

  get endDay() {
    return this.#endDay;
  }

  get monthNum(){
    return this.#startDay.month;
  }

  isSameMonth(other: Month){
    return this.#startDay.isSameMonth(other.startDay);
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

  format(): MonthFormat {
    return this.#startDay.format("YYYY-MM");
  }

}