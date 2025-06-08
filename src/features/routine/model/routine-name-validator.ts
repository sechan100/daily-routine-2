import { OBSIDIAN_FILE_TITLE_INVALID_CHARS_REGEX } from "@/shared/file/obsidian-file-title";



export class RoutineNameValidator {
  private otherNames: Set<string>;
  private previousName: string | null;

  constructor(allNames: string[], previousName: string | null) {
    this.otherNames = previousName ? new Set(allNames.filter(name => name !== previousName)) : new Set(allNames);
    this.previousName = previousName;
  }

  validate(name: string): string | undefined {
    // empty
    if (name.trim() === "") {
      return "Name is required.";
    }
    // obsidian file title
    if (OBSIDIAN_FILE_TITLE_INVALID_CHARS_REGEX.test(name)) {
      return "Name contains invalid characters.";
    }
    // other names
    if (this.otherNames.has(name)) {
      return "Routine with this name already exists.";
    }
    return undefined;
  }


}