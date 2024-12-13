import { err, ok, Result } from "neverthrow";
import { RoutineDto } from "../types";
import { RoutineProperties } from "./RoutineProperties";
import { ObsidianFileTitleValidation, validateObsidianFileTitle } from "@shared/validation/validate-obsidian-file-title";
import { parseFrontmatter } from "@shared/file/parse-frontmatter";
import { JsonConvertible } from "@shared/JsonConvertible";
import { Day } from "@shared/period/day";
import { RoutineTask } from "@entities/note";



type RoutineNameValidation = 'duplicated' | & ObsidianFileTitleValidation;


export class Routine implements JsonConvertible<RoutineDto> {
  private name: string;
  private properties: RoutineProperties;

  constructor(name: string, properties?: RoutineProperties){
    this.name = name;
    this.properties = properties ?? new RoutineProperties();
  }

  static fromFile(name: string, content: string): Routine {
    const fm = parseFrontmatter(content);
    return new Routine(name, RoutineProperties.fromObject(fm));
  }

  static fromJSON(json: RoutineDto): Routine {
    return new Routine(json.name, new RoutineProperties(json.properties));
  }

  serialize(): string {
    const properties = this.properties.serialize();
    const content = "";
    return `${properties}\n${content}`;
  }

  toJSON(): RoutineDto {
    return {
      name: this.name,
      properties: this.properties.toJSON()
    }
  }

  getName(): string {
    return this.name;
  }

  getProperties(): RoutineProperties {
    return this.properties;
  }

  /**
   * 
   * @param newName 변경할 이름
   * @param routineNames 기존에 존재하는 루틴 이름들
   */
  changeName(newName: string, routineNames: string[]): Result<string, RoutineNameValidation> {
    return Routine
    .validateName(newName, routineNames)
    .andThen(validated => {
      this.name = validated;
      return ok(validated);
    });
  }

  static validateName(name: string, routineNames: string[]): Result<string, RoutineNameValidation> {
    return validateObsidianFileTitle(name)
    .andThen(validated => {
      routineNames = routineNames.filter(rn => rn !== name);
      return routineNames.includes(validated) ? err('duplicated') : ok(validated);
    });
  }

  /**
   * NOTE: daysOfWeek와 daysOfMonth를 기준으로 루틴을 수행할지 말지를 결정한다.
   * - daysOfMonth가 0인 경우는 매월의 마지막 날을 의미한다.
   */
  isDueTo(day: Day): boolean {
    // MONTH 기준
    if(this.properties.getActiveCriteria() === "month") {
      const days = Array.from(this.properties.getDaysOfMonth());
      // 0이 존재하는 경우, 0을 매개받은 day의 달의 마지막 날짜로 치환한다.
      if(days.contains(0)) {
        const lastDayOfMonth = day.daysInMonth();
        days.remove(0);
        days.push(lastDayOfMonth);
      }
      if(!days.contains(day.date)) return false;
    }

    // WEEK 기준
    if(this.properties.getActiveCriteria() === "week") {
      if(!this.properties.getDaysOfWeek().contains(day.dow)) return false;
    }
    return true;
  }

}