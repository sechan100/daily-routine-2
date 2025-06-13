import { ComponentType } from "react";


export type PageType = "note" | "calendar" | "queue" | "achievement";


export type PageRouterRegistration = {
  name: PageType;
  Page: ComponentType;
}