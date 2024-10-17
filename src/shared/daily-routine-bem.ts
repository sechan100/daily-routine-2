import BEMHelper, { WordSet } from "react-bem-helper"


type DailyRoutineBEM = (element?: string, modifiers?: WordSet, extra?: WordSet) => string;
export const dr = (name: string): DailyRoutineBEM => {
  const ben = new BEMHelper({
    prefix: "dr-",
    name: name,
  })

  return (element?: string, modifiers?: WordSet, extra?: WordSet) => {
    return ben(element, modifiers, extra).className;
  }
}