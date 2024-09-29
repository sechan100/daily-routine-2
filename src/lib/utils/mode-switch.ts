import { getMarkdownView } from "./utils";

const findModeSwitchBtn = () => {
  const query = 'button.clickable-icon.view-action';
  return Array.from(getMarkdownView().containerEl.querySelectorAll(query
) as NodeListOf<HTMLButtonElement>)
  .find(btn => {
    return ( 
      btn.children[0].classList.contains('lucide-book-open')
      ||
      btn.children[0].classList.contains('lucide-edit-3')
    )
  }) as HTMLButtonElement;
}

export const modeSwitcher = {
  click: () => {
    const btn = findModeSwitchBtn();
    btn.click();
  },
  toSource: () => {
    if(getMarkdownView().getMode() === 'preview'){
      modeSwitcher.click();
    }
  },
  toPreview: () => {
    if(getMarkdownView().getMode() === 'source'){
      modeSwitcher.click();
    }
  },
  getMode: () => {
    return getMarkdownView().getMode();
  }
}