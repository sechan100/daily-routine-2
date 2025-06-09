/* eslint-disable @typescript-eslint/no-explicit-any */


export type CheckableState = "unchecked" | "accomplished" | "failed";

export type Checkable = {
  name: string;
  state: CheckableState;
}

export const isCheckable = (obj: any): obj is Checkable => {
  return obj && typeof obj.state === "string" && ["un-checked", "accomplished", "failed"].includes(obj.state);
}