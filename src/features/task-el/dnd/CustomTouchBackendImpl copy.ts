import { DragDropManager } from 'dnd-core';
import { HTML5BackendContext, HTML5BackendOptions } from 'react-dnd-html5-backend';
import { isTaskElDragItemType } from './drag-item';
import { TouchBackendContext, TouchBackendImpl, TouchBackendOptions } from 'react-dnd-touch-backend';



class CustomTouchBackendImpl extends TouchBackendImpl {

  constructor(manager: DragDropManager, globalContext: TouchBackendContext, options: Partial<TouchBackendOptions>){
    super(manager, globalContext, options);
    const originalHandleTopMoveEndCapture = this.handleTopMoveEndCapture;
    this.handleTopMoveEndCapture = (e: Event) => {
      const monitor = manager.getMonitor();
      const type = monitor.getItemType();
      if(typeof type === "string" && isTaskElDragItemType(type)){
        originalHandleTopMoveEndCapture(e);
      }
    }
  }
  
}

export const CustomTouchBackend = (manager: DragDropManager, globalContext: TouchBackendContext, options: Partial<TouchBackendOptions>) => {
  return new CustomTouchBackendImpl(manager, globalContext, options);
};