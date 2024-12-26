import { err, ok, Result } from "neverthrow";



export const validateObsidianFileTitle = (title: string): Result<string, string> => {
  if(title.trim() === ""){
    return err('empty');
  }
  const invalidCharsRegex = /[:/\\#[\]|^]/;
  if(invalidCharsRegex.test(title)){
    return err('contains-invalid-characters');
  }
  return ok(title);
}