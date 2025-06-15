import { getPlugin } from "@/app/plugin";
import { AbstractInputSuggest, TAbstractFile, TextComponent, TFile, TFolder } from "obsidian";


export class FileSuggest extends AbstractInputSuggest<TAbstractFile> {
  #isTypeRight: (file: TAbstractFile) => boolean;

  /**
   * TextComponent.setValue()로 변경한 데이터는 onChange 이벤트가 발생하지 않음.
   * FilSuggest.selectSuggestion()가 호출되고 나서 onChange를 발생시켜줘야함
   */
  #onSelectCbs: ((path: string) => void)[];


  constructor(private textComponent: TextComponent, type: "file" | "folder") {
    super(getPlugin().app, textComponent.inputEl);

    // File인지 Folder인지 검사하는 함수 초기화
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

    this.#onSelectCbs = [];

    textComponent.inputEl.blur();
  }

  getSuggestions(inputStr: string): TAbstractFile[] {
    const abstractFiles = getPlugin().app.vault.getAllLoadedFiles();
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
    this.#onSelectCbs.forEach(cb => cb(value.path));
    this.close();
  }

  onChange(callback: (value: string) => void): FileSuggest {
    this.textComponent.onChange(callback);
    this.#onSelectCbs.push(callback);
    return this;
  }

  override renderSuggestion(file: TAbstractFile, el: HTMLElement): void {
    el.setText(file.path);
  }

  setPlaceholder(placeholder: string): FileSuggest {
    this.textComponent.setPlaceholder(placeholder);
    return this;
  }

  setDefaultValue(value: string): FileSuggest {
    this.textComponent.setValue(value);
    return this;
  }
}