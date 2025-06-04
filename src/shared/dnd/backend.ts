import { BackendFactory, DragDropManager } from 'dnd-core';
import { HTML5BackendImpl } from 'node_modules/react-dnd-html5-backend/dist/HTML5BackendImpl';
import { HTML5BackendContext, HTML5BackendOptions } from 'react-dnd-html5-backend';
import { TouchBackendContext, TouchBackendImpl, TouchBackendOptions } from 'react-dnd-touch-backend';

const dragItemTypes = ["ROUTINE", "GROUP", "TASK"];

export class CustomHTML5Backend extends HTML5BackendImpl {

  constructor(manager: DragDropManager, globalContext?: HTML5BackendContext, options?: HTML5BackendOptions) {
    super(manager, globalContext, options);
    // const originalHandleTopDropCapture = this.handleTopDropCapture;
    // this.handleTopDropCapture = (e: DragEvent) => {
    //   const monitor = manager.getMonitor();
    //   const type = monitor.getItemType();
    //   if (typeof type === "string" && dragItemTypes.includes(type)) {
    //     originalHandleTopDropCapture(e);
    //   } else {
    //     throw new Error(`Unsupported drag item type: ${String(type)}. Supported types are: ${dragItemTypes.join(", ")}`);
    //   }
    // }
  }
}

export class CustomTouchBackend extends TouchBackendImpl {

  constructor(manager: DragDropManager, globalContext: TouchBackendContext, options: Partial<TouchBackendOptions>) {
    super(manager, globalContext, options);
    // const originalHandleTopMoveEndCapture = this.handleTopMoveEndCapture;
    // this.handleTopMoveEndCapture = (e: Event) => {
    //   const monitor = manager.getMonitor();
    //   const type = monitor.getItemType();
    //   if (typeof type === "string" && dragItemTypes.includes(type)) {
    //     originalHandleTopMoveEndCapture(e);
    //   } else {
    //     throw new Error(`Unsupported drag item type: ${String(type)}. Supported types are: ${dragItemTypes.join(", ")}`);
    //   }
    // }
  }

}

/**
 * 
 * @param dragItemTypes - 드래그 가능한 아이템의 타입 목록 (예: ["ROUTINE", "GROUP"])
 * @returns 
 */
export const getBackendFactories = (): { html5: BackendFactory; touch: BackendFactory } => {
  return {
    html5: (manager: DragDropManager, context: HTML5BackendContext, options: HTML5BackendOptions) => new CustomHTML5Backend(manager, context, options),
    touch: (manager: DragDropManager, globalContext: TouchBackendContext, options: Partial<TouchBackendOptions>) => new CustomTouchBackend(manager, globalContext, options),
  }
}