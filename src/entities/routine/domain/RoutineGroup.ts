import { ObsidianFileTitleValidation, validateObsidianFileTitle } from "@shared/validation/validate-obsidian-file-title";
import { err, ok, Result } from "neverthrow";
import { GroupProperties } from "./GroupProperties";
import { RoutineGroupDto } from "../types";
import { JsonConvertible } from "@shared/JsonConvertible";
import { GROUP_PREFIX } from "../persistence/utils";


type GroupNameValidation = 'duplicated' | & ObsidianFileTitleValidation;

export class RoutineGroup implements JsonConvertible<RoutineGroupDto> {
  public static UNGROUPED_NAME = "UNGROUPED";
  private name: string;
  private properties: GroupProperties;

  constructor(name: string, properties?: GroupProperties){
    this.name = name.startsWith(GROUP_PREFIX) ? name.slice(GROUP_PREFIX.length) : name;
    this.properties = properties ?? new GroupProperties();
  }

  serialize(): string {
    const properties = this.properties.serialize();
    const content = "";
    return `${properties}\n${content}`;
  }

  changeName(newName: string, groupNames: string[]): Result<string, GroupNameValidation> {
    return RoutineGroup
    .validateName(newName, groupNames)
    .andThen(validated => {
      this.name = validated;
      return ok(validated);
    });
  }

  static validateName(name: string, groupNames: string[]): Result<string, GroupNameValidation> {
    return validateObsidianFileTitle(name)
    .andThen(validated => {
      groupNames = groupNames.filter(gn => gn !== name);
      return groupNames.includes(validated) ? err('duplicated') : ok(validated);
    });
  }

  toJSON(): RoutineGroupDto {
    return {
      name: this.getName(),
      properties: this.getProperties().toJSON()
    }
  }

  getName(): string {
    return this.name;
  }

  getProperties(): GroupProperties {
    return this.properties;
  }
}