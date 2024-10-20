import BEMHelper, { WordSet } from "react-bem-helper"


type DailyRoutineBEM = (element?: string, modifiers?: WordSet, extra?: WordSet) => string;

export const dr = (name: string): DailyRoutineBEM => {
  const bemHelper = new BEMHelper({
    prefix: "dr-",
    name: name,
  })

  const bem = (element?: string, modifiers?: WordSet, extra?: WordSet) => {
    return bemHelper(element, modifiers, extra).className;
  }

  return bem;
}

