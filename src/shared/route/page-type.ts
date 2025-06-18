import { ComponentType } from "react";


export type PageType = "note" | "calendar" | "queue" | "achievement" | "routines";


export type PageRouterRegistration = {
  name: PageType;
  Page: ComponentType;
}