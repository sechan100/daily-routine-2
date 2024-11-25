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

  clone() {
    return new Month(this.#startDay.clone());
  }

  get startDay() {
    return this.#startDay;
  }

  get endDay() {
    return this.#startDay.clone(m => m.endOf("month"));
  }

  getMonth(){
    return this.#startDay.getMonth();
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