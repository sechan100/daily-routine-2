import { Active, Collision, Over, Translate } from "@dnd-kit/core";


export type DragEvent = {
  activatorEvent: Event;
  active: Active;
  collisions: Collision[] | null;
  delta: Translate;
  over: Over | null;
}