import { RoutineNoteDto } from "@entities/note";


export interface TodoValidation {
  isValid: boolean;
  type: "name-duplicate" | "name-empty" | "valid";
  message: string;
}

export const VALID_TODO_VALIDATION: TodoValidation = {
  isValid: true,
  type: "valid",
  message: "",
};


interface ValidateNameData {
  note: RoutineNoteDto;
  originalName?: string;
}
const validateName = (name: string, { note, originalName }: ValidateNameData): TodoValidation => {
  if(name.trim() === "") {
    return {
      isValid: false,
      type: "name-empty",
      message: "Name cannot be empty.",
    };
  }

  const sameNameTodo = note.root.filter((task) => task.name === name)[0] ?? null;
  if(sameNameTodo && sameNameTodo.name !== originalName) {
    return {
      isValid: false,
      type: "name-duplicate",
      message: "Name already exists in note.",
    };
  }

  return VALID_TODO_VALIDATION;
};


export const todoValidator = {
  name: validateName,
}