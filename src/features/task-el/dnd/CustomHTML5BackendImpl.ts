import { HTML5BackendImpl } from 'node_modules/react-dnd-html5-backend/dist/HTML5BackendImpl';
import { DragDropManager } from 'dnd-core';
import { HTML5BackendContext, HTML5BackendOptions } from 'react-dnd-html5-backend';
import { isTaskElDragItemType } from './drag-item';



class CustomHTML5BackendImpl extends HTML5BackendImpl {

  constructor(manager: DragDropManager, globalContext?: HTML5BackendContext, options?: HTML5BackendOptions){
    super(manager, globalContext, options);
    const originalHandleTopDropCapture = this.handleTopDropCapture;
    this.handleTopDropCapture = (e: DragEvent) => {
      const monitor = manager.getMonitor();
      const type = monitor.getItemType();
      if(typeof type === "string" && isTaskElDragItemType(type)){
        originalHandleTopDropCapture(e);
      }
    }
  }
  
}

export const CustomHTML5Backend = (manager: DragDropManager, context: HTML5BackendContext, options: HTML5BackendOptions) => {
  return new CustomHTML5BackendImpl(manager, context, options);
};