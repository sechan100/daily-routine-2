import { Notice } from "obsidian";



export class NoticeError extends Error {
  constructor(message: string) {
    super(message);
    new Notice(message);
  }
}