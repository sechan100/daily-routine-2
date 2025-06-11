import { ComponentType } from "react";


export type PageType = "note" | "calendar" | "achievement";


export type PageRouterRegistration = {
  name: PageType;
  Page: ComponentType;
}