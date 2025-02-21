// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { AbstractInputSuggest, TAbstractFile, TFile, TFolder } from "obsidian";
import { plugin } from "@shared/utils/plugin-service-locator";


export class FileSuggest extends AbstractInputSuggest<TAbstractFile> {
  #isTypeRight: (file: TAbstractFile) => boolean;

  constructor(private inputEl: HTMLInputElement, type: "file" | "folder") {
    super(plugin().app, inputEl);
    this.#isTypeRight = 
    type === "file" 
      ?
    function (file: TAbstractFile): file is TFile {
      return file instanceof TFile;
    }
      : 
    function (file: TAbstractFile): file is TFolder {
      return file instanceof TFolder;
    };
  }

  getSuggestions(inputStr: string): TAbstractFile[] {
    const abstractFiles = plugin().app.vault.getAllLoadedFiles();
    const files: TAbstractFile[] = [];
    const lowerCaseInputStr = inputStr.toLowerCase();

    abstractFiles.forEach((file: TAbstractFile) => {

      if (
        this.#isTypeRight(file) &&
        file.path.toLowerCase().contains(lowerCaseInputStr)
      ) {
        files.push(file);
      }
    });

    return files.slice(0, 1000);
  }

  override selectSuggestion(value: TAbstractFile, evt: MouseEvent | KeyboardEvent): void {
    this.setValue(value.path);
  }
  
  override renderSuggestion(file: TAbstractFile, el: HTMLElement): void {
    el.setText(file.path);
  }
}