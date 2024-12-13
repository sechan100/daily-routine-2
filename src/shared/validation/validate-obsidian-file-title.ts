import { err, ok, Result } from "neverthrow";



export type ObsidianFileTitleValidation = 'contains-invalid-characters';

export const validateObsidianFileTitle = (title: string): Result<string, ObsidianFileTitleValidation> => {
  const invalidCharsRegex = /[:/\\#[\]|^]/;
  if(invalidCharsRegex.test(title)){
    return err('contains-invalid-characters');
  }
  return ok(title);

}