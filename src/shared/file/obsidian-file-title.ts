import { err, ok, Result } from "neverthrow";


export const OBSIDIAN_FILE_TITLE_INVALID_CHARS = [
  ':', '/', '\\', '#', '[', ']', '|', '^'
];

export const OBSIDIAN_FILE_TITLE_INVALID_CHARS_REGEX = /[:/\\#[\]|^]/;