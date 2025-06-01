import { PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { globalDndConfig } from "./global-dnd-config";



export const useDndKitSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: globalDndConfig.pointerSensorDelay,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: globalDndConfig.touchSensorDelay,
        tolerance: 5,
      },
    })
  );
}