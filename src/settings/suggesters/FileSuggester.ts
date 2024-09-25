// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { TAbstractFile, TFile, TFolder } from "obsidian";
import { TextInputSuggest } from "./suggest";
import { plugin } from "src/shared/utils/plugin-service-locator";


export class FileSuggest extends TextInputSuggest<TAbstractFile> {
  #isTypeRight: (file: TAbstractFile) => boolean;

  constructor(inputEl: HTMLInputElement, type: "file" | "folder") {
    super(inputEl);
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

  renderSuggestion(file: TAbstractFile, el: HTMLElement): void {
    el.setText(file.path);
  }

  selectSuggestion(file: TAbstractFile): void {
    this.inputEl.value = file.path;
    this.inputEl.trigger("input");
    this.close();
  }
}