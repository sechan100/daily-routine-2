/* eslint-disable @typescript-eslint/no-explicit-any */



export type DrNode = {
  name: string;
}

export type CheckableState = "unchecked" | "accomplished" | "failed";

export interface Checkable extends DrNode {
  state: CheckableState;
}

export interface Group<C extends Checkable = Checkable> extends DrNode {
  children: C[];
  isOpen: boolean;
}

export const isCheckable = (obj: any): obj is Checkable => {
  return obj && typeof obj.state === "string" && ["un-checked", "accomplished", "failed"].includes(obj.state);
}

export const isGroup = <C extends Checkable = Checkable>(obj: any): obj is Group<C> => {
  return obj && Array.isArray(obj.children) && typeof obj.isOpen === "boolean";
}