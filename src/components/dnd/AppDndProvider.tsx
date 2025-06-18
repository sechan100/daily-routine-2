import {
  createTransition, DndProvider,
  // TouchTransition,
  // MouseTransition,
  MultiBackendOptions
} from "react-dnd-multi-backend";
import { TouchBackendOptions } from "react-dnd-touch-backend";
import { getBackendFactories } from "./backend";

const MouseTransition = createTransition('mousedown', (event) => {
  const b = event.type.contains('mouse');
  return b;
})

const TouchTransition = createTransition('touchstart', (event) => {
  const b = event.type.contains('touch');
  return b;
})

const getMultiBackend = (): MultiBackendOptions => {
  const { html5, touch } = getBackendFactories();
  return {
    backends: [
      {
        id: "html5",
        backend: html5,
        transition: MouseTransition,
      },
      {
        id: "touch",
        backend: touch,
        options: {
          enableMouseEvents: false,
          /**
           * HACK: 아예 없애버리면 mobile에서 file, 또는 directory의 context menu를 열었을 때,
           * 앱에서 스크롤이 안되는 버그가 생긴다. 대충 0.5정도로 해두니 일단 해결됨.
           */
          delayTouchStart: 500,
          ignoreContextMenu: false,
        } as TouchBackendOptions,
        transition: TouchTransition,
      },
    ],
  }
}

const multiBackend = getMultiBackend();

type Props = {
  children?: React.ReactNode;
}
export const AppDndProvider = ({
  children
}: Props) => {

  return (
    <DndProvider options={multiBackend}>
      {children}
    </DndProvider>
  )
}