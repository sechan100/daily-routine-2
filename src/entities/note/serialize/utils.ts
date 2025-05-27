import { Notice } from "obsidian";

export const deserializeError = (message: string) => {
  new Notice(`Note Deserialize Error`);
  return new Error(`[Routine Note Deserialize Error]: ${message}`);
}