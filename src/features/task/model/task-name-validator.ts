


export class TaskNameValidator {
  private otherNames: Set<string>;
  private currentName: string | null;

  constructor(allNames: string[], currentName: string | null) {
    this.otherNames = currentName ? new Set(allNames.filter(name => name !== currentName)) : new Set(allNames);
    this.currentName = currentName;
  }

  validate(name: string): string | undefined {
    // empty
    if (name.trim() === "") {
      return "Name is required.";
    }
    // other names
    if (this.otherNames.has(name)) {
      return `Name "${name}" already exists.`;
    }
    return undefined;
  }


}