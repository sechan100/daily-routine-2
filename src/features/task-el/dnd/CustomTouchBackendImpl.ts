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
      } else {
        // task drag가 아닌 경우에도 원본 handler의 상태 정리는 그대로 수행해야한다. (drop/endDrag만 억제)
        // 정리하지 않으면 _isScrolling, moveStartSourceIds 등이 남아서 이후의 터치 동작이 오작동한다.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const self = this as any;
        self._isScrolling = false;
        self.lastTargetTouchFallback = undefined;
        self.moveStartSourceIds = undefined;
      }
    }
  }
  
}

export const CustomTouchBackend = (manager: DragDropManager, globalContext: TouchBackendContext, options: Partial<TouchBackendOptions>) => {
  return new CustomTouchBackendImpl(manager, globalContext, options);
};