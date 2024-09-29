import { Editor, MarkdownView } from "obsidian";
import { plugin } from "../plugin-service-locator"





export const getFilePath = () => {
  const file = plugin().app.workspace.getActiveFile();
  if(!file) throw new Error('No active file');
  return file.path;
}

export const getMarkdownView: () => MarkdownView = () => {
  const view = plugin().app.workspace.getActiveViewOfType(MarkdownView);
  if(!view) throw new Error('No active markdown view');
  return view;
}



export interface Line {
  lineNum: number; // 0 ~ n;
  text: string;
}
export const searchText = (e: Editor, regex: RegExp): Line[] => {
  const lineCount = e.lineCount();
  const results: Line[] = [];
  for (let i = 0; i < lineCount; i++) {
    const l = e.getLine(i);
    const match = l.match(regex);
    if(match) {
      results.push({lineNum: i, text: l});
    }
  }
  return results;
}