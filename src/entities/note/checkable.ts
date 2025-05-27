/* eslint-disable @typescript-eslint/no-explicit-any */



export type CheckableState = "un-checked" | "accomplished" | "failed";

export type Checkable = {
  state: CheckableState;
}

export const checkableTypeGuards = {
  isCheckable: (obj: any): obj is Checkable => {
    return obj && typeof obj.state === "string" && ["un-checked", "accomplished", "failed"].includes(obj.state);
  }
};